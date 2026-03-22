/// <reference path="../../global.d.ts" />
import {
    COMPLEX, NULLABLE, OPTIONAL, SCRATCH,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_UNION, K_REFINE, K_TUPLE,
    K_RECORD, K_OR, K_EXCLUSIVE, K_INTERSECT, K_NOT, K_CONDITIONAL,
    HAS_VALIDATOR, sortByKeyId,
} from "./catalog.js";

import { popcnt16, REST, V_OBJ_PAT_PROP, V_OBJ_NO_ADD } from "./const.js";

import {
    N_PRIM, N_OBJECT, N_ARRAY, N_REFINE, N_OR,
    N_EXCLUSIVE, N_INTERSECT, N_NOT, N_CONDITIONAL, N_TUPLE, N_REF,
} from "./schema.js";

const KIND_MASK = 0x0FFFFFFF;
const MAX_DEPTH = 512;

// Compiler states — tracks each node's progress through the two-visit pattern.
const UNVISITED = 0;
const VISITING  = 1;
const COMPILED  = 2;

const SENTINEL = 0xFFFFFFFF;

// ────────────────────────────────────────────────────────────────────────────
// compile(cat, ast) → CompiledSchema
// ────────────────────────────────────────────────────────────────────────────
//
// Compiles a FlatAst (from parseJsonSchema) into the catalog's runtime heap.
//
// ## Algorithm
//
// Uses an iterative two-visit pattern with an explicit stack:
//
//   Visit 1 (UNVISITED → VISITING): push self back, then push all children.
//   Visit 2 (VISITING  → COMPILED): all children are compiled; emit this node.
//
// Leaf nodes (N_PRIM) compile in a single visit. $ref nodes may need to
// wait for their target and are re-pushed if the target isn't ready yet.
//
// ## Edge slab access
//
// The FlatAst stores variable-length children in a unified `astEdges` slab:
//
//   Object properties:  astEdges[offset + i*3 + 0] = nameIdx (into propNames)
//                        astEdges[offset + i*3 + 1] = child node id
//                        astEdges[offset + i*3 + 2] = property flags (0=required, 1=optional)
//
//   List members:       astEdges[offset + i] = child node id
//
//   Conditional slots:  astEdges[offset + 0] = ifId
//                        astEdges[offset + 1] = thenId  (SENTINEL if absent)
//                        astEdges[offset + 2] = elseId  (SENTINEL if absent)
//
// ## Validator compilation
//
// Nodes with astVHeaders[nodeId] != 0 carry validator constraints. The
// compiler reads the vHeader and payload values, then calls allocValidator()
// to register them in the catalog's validator slab. The kind header is
// OR'd with HAS_VALIDATOR and the validator index is stored in an extra
// kind slot.
//
// ────────────────────────────────────────────────────────────────────────────

/**
 * Compiles a FlatAst into the catalog's heap storage.
 * @template {symbol} R
 * @param {uvd.Catalog<R>} cat — a catalog instance returned by catalog()
 * @param {uvd.FlatAst} ast
 * @returns {uvd.CompiledSchema}
 */
export function compile(cat, ast) {
    let heap = cat.__heap;
    let HEAP = heap.HEAP;
    let allocKind      = heap.allocKind;
    let allocValidator = heap.allocValidator;
    let allocOnSlab    = heap.allocOnSlab;
    let lookup         = heap.lookup;
    let registerObject = heap.registerObject;
    let registerArray  = heap.registerArray;
    let registerUnion  = heap.registerUnion;

    let scratch = false;

    let {
        astKinds, astFlags, astChild0, astChild1,
        astVHeaders, astVOffset, vPayloads,
        astEdges, propNames, callbacks,
        rootId, defIds, defNames, nodeCount,
    } = ast;

    // Per-node compiler state
    let astState    = new Uint8Array(nodeCount);
    let astCompiled = new Uint32Array(nodeCount);

    // Circular $ref patches: [refNodeId, targetNodeId, reservedKindPtr]
    /** @type {Array<[number, number, number]>} */
    let circularPatches = [];

    // Explicit compilation stack
    let stack = new Uint32Array(MAX_DEPTH);
    let sp = 0;

    // Push all defs first so they're available for $ref resolution
    for (let i = 0; i < defIds.length; i++) {
        stack[sp++] = defIds[i];
    }
    stack[sp++] = rootId;

    // ── Helper: build validator payloads from the FlatAst slab ──

    /**
     * Reads a node's validator header + payloads and allocates them on the
     * catalog's validator heap. Returns [hasValidator, validatorIndex].
     * @param {number} nodeId
     * @returns {[boolean, number]}
     */
    function compileValidator(nodeId) {
        let vHeader = astVHeaders[nodeId];
        if (vHeader === 0) return [false, 0];
        let off   = astVOffset[nodeId];
        let count = popcnt16(vHeader & 0xFFFF);
        let nodePayloads = new Array(count);
        for (let i = 0; i < count; i++) {
            nodePayloads[i] = vPayloads[off + i];
        }
        return [true, allocValidator(vHeader, nodePayloads, scratch)];
    }

    // ── Main compilation loop ──

    while (sp > 0) {
        let nodeId = stack[--sp];

        if (astState[nodeId] === COMPILED) continue;

        let kind = astKinds[nodeId];

        // ── Primitives: compile immediately (leaf node) ──
        if (kind === N_PRIM) {
            let [hasVal, valIdx] = compileValidator(nodeId);
            if (hasVal) {
                let primBits = astFlags[nodeId];
                let kindHeader = K_PRIMITIVE | HAS_VALIDATOR | primBits;
                let kindPtr = allocKind(kindHeader, valIdx, scratch, 2);
                astCompiled[nodeId] = (COMPLEX | kindPtr) >>> 0;
            } else {
                astCompiled[nodeId] = astFlags[nodeId];
            }
            astState[nodeId] = COMPILED;
            continue;
        }

        // ── $ref resolution ──
        if (kind === N_REF) {
            let targetId = astChild0[nodeId];

            if (astState[nodeId] === VISITING) {
                // Re-visit: target should be compiled by now
                if (astState[targetId] === COMPILED) {
                    astCompiled[nodeId] = astCompiled[targetId];
                    astState[nodeId] = COMPILED;
                } else {
                    // Target still not done — push both back
                    stack[sp++] = nodeId;
                    stack[sp++] = targetId;
                }
                continue;
            }

            // First visit
            if (astState[targetId] === COMPILED) {
                astCompiled[nodeId] = astCompiled[targetId];
                astState[nodeId] = COMPILED;
                continue;
            }

            if (astState[targetId] === VISITING) {
                // Circular dependency — reserve kind slots for later patching
                let kindPtr = HEAP.KIND_PTR;
                HEAP.KIND_PTR += 2;
                astCompiled[nodeId] = (COMPLEX | kindPtr) >>> 0;
                astState[nodeId] = COMPILED;
                circularPatches.push([nodeId, targetId, kindPtr]);
                continue;
            }

            // Target unvisited — schedule it
            astState[nodeId] = VISITING;
            stack[sp++] = nodeId;
            stack[sp++] = targetId;
            continue;
        }

        // ── Complex nodes: two-visit pattern ──

        if (astState[nodeId] === UNVISITED) {
            // Visit 1: mark as visiting, push self back, push children
            astState[nodeId] = VISITING;
            stack[sp++] = nodeId;

            switch (kind) {
                case N_OBJECT: {
                    let offset = astChild0[nodeId];
                    let count  = astChild1[nodeId];
                    for (let i = 0; i < count; i++) {
                        stack[sp++] = astEdges[offset + i * 3 + 1]; // childId
                    }
                    let flags = astFlags[nodeId];
                    let extraOff = offset + count * 3;
                    // additionalProperties child (bit 0)
                    if (flags & 1) {
                        stack[sp++] = astEdges[extraOff];
                        extraOff++;
                    }
                    // patternProperties children (bit 1)
                    if (flags & 2) {
                        let patCount = astEdges[extraOff++];
                        for (let i = 0; i < patCount; i++) {
                            extraOff++; // skip pattern name index
                            stack[sp++] = astEdges[extraOff++]; // child id
                        }
                    }
                    break;
                }
                case N_ARRAY: {
                    stack[sp++] = astChild0[nodeId]; // element type
                    break;
                }
                case N_OR:
                case N_EXCLUSIVE:
                case N_INTERSECT: {
                    let offset = astChild0[nodeId];
                    let count  = astChild1[nodeId];
                    for (let i = 0; i < count; i++) {
                        stack[sp++] = astEdges[offset + i];
                    }
                    break;
                }
                case N_NOT: {
                    stack[sp++] = astChild0[nodeId];
                    break;
                }
                case N_CONDITIONAL: {
                    let base = astChild0[nodeId];
                    if (astEdges[base + 2] !== SENTINEL) stack[sp++] = astEdges[base + 2]; // else
                    if (astEdges[base + 1] !== SENTINEL) stack[sp++] = astEdges[base + 1]; // then
                    stack[sp++] = astEdges[base]; // if
                    break;
                }
                case N_TUPLE: {
                    let offset = astChild0[nodeId];
                    let count  = astChild1[nodeId];
                    for (let i = 0; i < count; i++) {
                        stack[sp++] = astEdges[offset + i];
                    }
                    // rest type child (bit 0)
                    if (astFlags[nodeId] & 1) {
                        stack[sp++] = astEdges[offset + count];
                    }
                    break;
                }
                case N_REFINE: {
                    stack[sp++] = astChild0[nodeId]; // inner type
                    break;
                }
            }
            continue;
        }

        // ── Visit 2: all children compiled — emit this node ──

        switch (kind) {
            case N_OBJECT: {
                let offset = astChild0[nodeId];
                let count  = astChild1[nodeId];
                let resolved = new Array(count * 2);

                for (let i = 0; i < count; i++) {
                    let nameIdx = astEdges[offset + i * 3];
                    let childId = astEdges[offset + i * 3 + 1];
                    let oflags  = astEdges[offset + i * 3 + 2];

                    resolved[i * 2] = lookup(propNames[nameIdx]);
                    let compiled = astCompiled[childId] >>> 0;
                    if (oflags) compiled = (compiled | OPTIONAL) >>> 0;
                    resolved[i * 2 + 1] = compiled;
                }
                sortByKeyId(resolved);

                // Read extra edges: additionalProperties + patternProperties
                let objFlags = astFlags[nodeId];
                let extraOff = offset + count * 3;
                let additionalType = 0;

                if (objFlags & 1) {
                    // additionalProperties child
                    additionalType = astCompiled[astEdges[extraOff]] >>> 0;
                    extraOff++;
                }

                // patternProperties: build validator payloads
                let patPayloads = null;
                if (objFlags & 2) {
                    let patCount = astEdges[extraOff++];
                    patPayloads = [];
                    for (let i = 0; i < patCount; i++) {
                        let patNameIdx = astEdges[extraOff++];
                        let patChildId = astEdges[extraOff++];
                        let patString = propNames[patNameIdx];
                        let patCompiledType = astCompiled[patChildId] >>> 0;
                        patPayloads.push(patString, patCompiledType);
                    }
                }

                let objId = registerObject(resolved, count, scratch);

                // Build validator — may need to inject additionalType and patternProperties
                let [hasVal, valIdx] = compileValidator(nodeId);

                /**
                 * Rebuild the validator when we have extra sequential payloads
                 * (patternProperties and/or additionalProperties type) that
                 * aren't in the AST's popcount-based payload array.
                 */
                if (patPayloads !== null || additionalType !== 0 || (astVHeaders[nodeId] & V_OBJ_NO_ADD)) {
                    let vHeader = astVHeaders[nodeId];
                    let off = astVOffset[nodeId];
                    let pcount = popcnt16(vHeader & 0xFFFF);
                    let nodePayloads = [];
                    for (let i = 0; i < pcount; i++) {
                        nodePayloads.push(vPayloads[off + i]);
                    }
                    if (patPayloads !== null) {
                        // V_OBJ_PAT_PROP payload: [count, reIdx0, type0, reIdx1, type1, ...]
                        let regexCache = scratch ? heap.S_REGEX_CACHE : heap.REGEX_CACHE;
                        nodePayloads.push(patPayloads.length / 2);
                        for (let i = 0; i < patPayloads.length; i += 2) {
                            let re = new RegExp(patPayloads[i], "u");
                            let reIdx = regexCache.length;
                            regexCache.push(re);
                            nodePayloads.push(reIdx);
                            nodePayloads.push(patPayloads[i + 1]);
                        }
                        vHeader |= V_OBJ_PAT_PROP;
                    }
                    if (vHeader & V_OBJ_NO_ADD) {
                        nodePayloads.push(additionalType);
                    }
                    valIdx = allocValidator(vHeader, nodePayloads, scratch);
                    hasVal = true;
                }

                let kindHeader = hasVal ? (K_OBJECT | HAS_VALIDATOR) : K_OBJECT;
                let slots = hasVal ? 3 : 2;
                let kindPtr = allocKind(kindHeader, objId, scratch, slots);
                if (hasVal) HEAP.KINDS[kindPtr + 2] = valIdx;
                astCompiled[nodeId] = (COMPLEX | kindPtr) >>> 0;
                break;
            }

            case N_ARRAY: {
                let elemType = astCompiled[astChild0[nodeId]];
                let arrId = registerArray(elemType, scratch);
                let [hasVal, valIdx] = compileValidator(nodeId);
                let kindHeader = hasVal ? (K_ARRAY | HAS_VALIDATOR) : K_ARRAY;
                let slots = hasVal ? 3 : 2;
                let kindPtr = allocKind(kindHeader, arrId, scratch, slots);
                if (hasVal) HEAP.KINDS[kindPtr + 2] = valIdx;
                astCompiled[nodeId] = (COMPLEX | kindPtr) >>> 0;
                break;
            }

            case N_OR: {
                let offset = astChild0[nodeId];
                let count  = astChild1[nodeId];
                let types = new Array(count);
                let allPrimitive = true;
                let merged = 0;
                for (let i = 0; i < count; i++) {
                    types[i] = astCompiled[astEdges[offset + i]];
                    if (types[i] & COMPLEX) {
                        allPrimitive = false;
                    } else {
                        merged |= types[i];
                    }
                }
                if (allPrimitive) {
                    astCompiled[nodeId] = merged >>> 0;
                } else {
                    let matchId = allocOnSlab(types, scratch, 'match');
                    let kindPtr = allocKind(K_OR, matchId, scratch, 2);
                    let flags = COMPLEX | kindPtr;
                    for (let i = 0; i < types.length; i++) {
                        if (types[i] & NULLABLE) flags |= NULLABLE;
                        if (types[i] & OPTIONAL) flags |= OPTIONAL;
                    }
                    astCompiled[nodeId] = flags >>> 0;
                }
                break;
            }

            case N_EXCLUSIVE: {
                let offset = astChild0[nodeId];
                let count  = astChild1[nodeId];
                let types = new Array(count);
                for (let i = 0; i < count; i++) {
                    types[i] = astCompiled[astEdges[offset + i]];
                }
                let matchId = allocOnSlab(types, scratch, 'match');
                let kindPtr = allocKind(K_EXCLUSIVE, matchId, scratch, 2);
                astCompiled[nodeId] = (COMPLEX | kindPtr) >>> 0;
                break;
            }

            case N_INTERSECT: {
                let offset = astChild0[nodeId];
                let count  = astChild1[nodeId];
                let types = new Array(count);
                for (let i = 0; i < count; i++) {
                    types[i] = astCompiled[astEdges[offset + i]];
                }
                let matchId = allocOnSlab(types, scratch, 'match');
                let kindPtr = allocKind(K_INTERSECT, matchId, scratch, 2);
                astCompiled[nodeId] = (COMPLEX | kindPtr) >>> 0;
                break;
            }

            case N_NOT: {
                let innerType = astCompiled[astChild0[nodeId]];
                let kindPtr = allocKind(K_NOT, innerType >>> 0, scratch, 2);
                astCompiled[nodeId] = (COMPLEX | kindPtr) >>> 0;
                break;
            }

            case N_CONDITIONAL: {
                let base = astChild0[nodeId];
                let ifType   = astCompiled[astEdges[base]];
                let thenType = astEdges[base + 1] !== SENTINEL ? astCompiled[astEdges[base + 1]] : 0;
                let elseType = astEdges[base + 2] !== SENTINEL ? astCompiled[astEdges[base + 2]] : 0;
                let types = [ifType, thenType, elseType];
                let matchId = allocOnSlab(types, scratch, 'match');
                let kindPtr = allocKind(K_CONDITIONAL, matchId, scratch, 2);
                astCompiled[nodeId] = (COMPLEX | kindPtr) >>> 0;
                break;
            }

            case N_TUPLE: {
                let offset = astChild0[nodeId];
                let count  = astChild1[nodeId];
                /** Append restType | REST as extra slab element when present */
                let hasRestElem = (astFlags[nodeId] & 1) !== 0;
                let totalCount = hasRestElem ? count + 1 : count;
                let types = new Array(totalCount);
                for (let i = 0; i < count; i++) {
                    types[i] = astCompiled[astEdges[offset + i]];
                }
                if (hasRestElem) {
                    types[count] = (astCompiled[astEdges[offset + count]] | REST) >>> 0;
                }
                let tupleId = allocOnSlab(types, scratch, 'tuple');

                let [hasVal, valIdx] = compileValidator(nodeId);
                let kindHeader = hasVal ? (K_TUPLE | HAS_VALIDATOR) : K_TUPLE;
                let slots = hasVal ? 3 : 2;
                let kindPtr = allocKind(kindHeader, tupleId, scratch, slots);
                if (hasVal) HEAP.KINDS[kindPtr + 2] = valIdx;
                astCompiled[nodeId] = (COMPLEX | kindPtr) >>> 0;
                break;
            }

            case N_REFINE: {
                let innerType = astCompiled[astChild0[nodeId]];
                let cbIdx = astChild1[nodeId];
                let callbacksArr = HEAP.CALLBACKS;
                let callbackIdx = callbacksArr.push(callbacks[cbIdx]) - 1;
                let kindPtr = allocKind(K_REFINE, innerType >>> 0, scratch, 3);
                HEAP.KINDS[kindPtr + 2] = callbackIdx;
                let flags = COMPLEX | kindPtr;
                if (innerType & NULLABLE) flags |= NULLABLE;
                if (innerType & OPTIONAL) flags |= OPTIONAL;
                astCompiled[nodeId] = flags >>> 0;
                break;
            }
        }
        astState[nodeId] = COMPILED;
    }

    // ── Patch circular $ref dependencies ──
    for (let i = 0; i < circularPatches.length; i++) {
        let [refNodeId, targetId, kindPtr] = circularPatches[i];
        let compiled = astCompiled[targetId];
        if (typeof compiled === 'number' && (compiled & COMPLEX) === 0) {
            // Raw primitive → promote to K_PRIMITIVE
            HEAP.KINDS[kindPtr] = K_PRIMITIVE | compiled;
            HEAP.KINDS[kindPtr + 1] = 0;
        } else {
            // Complex type → copy the kind entry
            let realPtr = compiled & KIND_MASK;
            HEAP.KINDS[kindPtr] = HEAP.KINDS[realPtr];
            HEAP.KINDS[kindPtr + 1] = HEAP.KINDS[realPtr + 1];
        }
    }

    // ── Build result ──
    /** @type {Record<string, number>} */
    let resultDefs = {};
    for (let i = 0; i < defNames.length; i++) {
        resultDefs[defNames[i]] = astCompiled[defIds[i]];
    }

    return { root: astCompiled[rootId], defs: resultDefs };
}
