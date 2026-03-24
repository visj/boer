/// <reference path="../../global.d.ts" />
import {
    COMPLEX, NULLABLE, OPTIONAL, SCRATCH,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_RECORD,
    K_OR, K_EXCLUSIVE, K_INTERSECT,
    K_UNION, K_TUPLE, K_REFINE, K_NOT,
    K_CONDITIONAL,
    K_VALIDATOR, sortByKeyId,
    BARE_ARRAY, BARE_OBJECT, BARE_RECORD
} from "./catalog.js";

import { popcnt16, REST, ANY, STRING, NUMBER, INTEGER, V_PATTERN, V_PATTERN_PROPERTIES, V_ADDITIONAL_PROPERTIES, V_DEPENDENT_REQUIRED, V_ENUM, V_CONTAINS, V_PROPERTY_NAMES } from "./const.js";

import {
    N_PRIM, N_OBJECT, N_ARRAY, N_REFINE, N_OR,
    N_EXCLUSIVE, N_INTERSECT, N_NOT, N_CONDITIONAL, N_TUPLE, N_REF,
    N_BARE_ARRAY, N_BARE_OBJECT,
} from "./schema.js";

const KIND_MASK = 0x0FFFFFFF;
const MAX_DEPTH = 512;

// Compiler states — tracks each node's progress through the two-visit pattern.
const UNVISITED = 0;
const VISITING = 1;
const COMPILED = 2;

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
 * @template T
 * @template {symbol} R
 * @param {uvd.Catalog<R>} cat — a catalog instance returned by catalog()
 * @param {uvd.FlatAst} ast
 * @returns {uvd.SchemaResource<T, R>[]}
 */
export function compile(cat, ast) {
    let heap = cat.__heap;
    let HEAP = heap.HEAP;
    let malloc = heap.malloc;
    let allocValidator = heap.allocValidator;
    let lookup = heap.lookup;

    let scratch = false;

    let {
        astKinds, astFlags, astChild0, astChild1,
        astVHeaders, astVOffset, vPayloads,
        astEdges, propNames, callbacks, regexes,
        rootIds, rootNames, rootUris, nodeCount,
    } = ast;

    // Per-node compiler state
    let astState = new Uint8Array(nodeCount);
    let astCompiled = new Uint32Array(nodeCount);

    // Circular $ref patches: [refNodeId, targetNodeId, reservedKindPtr]
    /** @type {Array<[number, number, number]>} */
    let circularPatches = [];

    // Explicit compilation stack
    let stack = new Uint32Array(MAX_DEPTH);
    let sp = 0;

    // Push all entry-point roots
    for (let i = 0; i < rootIds.length; i++) {
        stack[sp++] = rootIds[i];
    }

    // ── Helper: build validator payloads from the FlatAst slab ──

    /**
     * Reads a node's fixed-slot validator payloads (bits 0–15) and returns
     * the packed vHeader and nodePayloads ready for passing to malloc or
     * allocValidator, without allocating.
     *
     * Returns null if the node has no validators.
     *
     * V_PATTERN payload is an index into ast.regexes[]; this function
     * converts it to a real REGEX_CACHE index.
     *
     * NOTE: sequential high-bit payloads (V_DEPENDENT_REQUIRED, etc.) are NOT
     * included — the N_OBJECT second-visit rebuild block reads them directly
     * from vPayloads when needed.
     *
     * @param {number} nodeId
     * @returns {{vHeader: number, nodePayloads: !Array<number>}|null}
     */
    function compileValidator(nodeId) {
        let vHeader = astVHeaders[nodeId];
        if (vHeader === 0) return null;
        let off = astVOffset[nodeId];
        let count = popcnt16(vHeader & 0xFFFF);
        let regexCache = heap.REGEX_CACHE;
        let patternSlot = (vHeader & V_PATTERN) ? popcnt16(vHeader & (V_PATTERN - 1)) : -1;
        let nodePayloads = new Array(count);
        for (let i = 0; i < count; i++) {
            let raw = vPayloads[off + i];
            if (i === patternSlot) {
                // raw is an index into ast.regexes[]; push to REGEX_CACHE
                nodePayloads[i] = regexCache.push(regexes[raw]) - 1;
            } else {
                nodePayloads[i] = raw;
            }
        }
        return { vHeader, nodePayloads };
    }

    // ── Main compilation loop ──

    while (sp > 0) {
        let nodeId = stack[--sp];

        if (astState[nodeId] === COMPILED) {
            continue;
        }

        let kind = astKinds[nodeId];

        // ── Primitives: compile immediately (leaf node) ──
        if (kind === N_PRIM) {
            let vHeader = astVHeaders[nodeId];
            if (vHeader !== 0) {
                let primBits = astFlags[nodeId];
                let off = astVOffset[nodeId];
                let fixedCount = popcnt16(vHeader & 0xFFFF);
                let nodePayloads = [];
                // Read fixed-slot payloads (bits 0-15), remapping regex placeholder indices.
                let patternSlot = (vHeader & V_PATTERN) ? popcnt16(vHeader & (V_PATTERN - 1)) : -1;
                for (let i = 0; i < fixedCount; i++) {
                    let raw = vPayloads[off + i];
                    if (i === patternSlot) {
                        nodePayloads.push(heap.REGEX_CACHE.push(regexes[raw]) - 1);
                    } else {
                        nodePayloads.push(raw);
                    }
                }
                // V_ENUM sequential section (bit 20): remap virtual string indices to real
                // catalog keyIds, sort independently, then append number segment.
                if (vHeader & V_ENUM) {
                    let p = off + fixedCount;
                    if (primBits & STRING) {
                        let strCount = vPayloads[p++] | 0;
                        let keyIds = new Array(strCount);
                        for (let i = 0; i < strCount; i++) {
                            keyIds[i] = lookup(propNames[vPayloads[p++] | 0]);
                        }
                        keyIds.sort((a, b) => a - b);
                        nodePayloads.push(strCount);
                        for (let i = 0; i < strCount; i++) { nodePayloads.push(keyIds[i]); }
                    }
                    if (primBits & (NUMBER | INTEGER)) {
                        let numCount = vPayloads[p++] | 0;
                        let nums = new Array(numCount);
                        for (let i = 0; i < numCount; i++) { nums[i] = vPayloads[p++]; }
                        nums.sort((a, b) => a - b);
                        nodePayloads.push(numCount);
                        for (let i = 0; i < numCount; i++) { nodePayloads.push(nums[i]); }
                    }
                }
                /** K_PRIMITIVE stores the validator index as inline (KINDS slot 1). */
                let valIdx = allocValidator(vHeader, nodePayloads, scratch);
                let result = malloc(K_PRIMITIVE | K_VALIDATOR | primBits, scratch, valIdx, null, 0, 0, null);
                // Preserve NULLABLE / OPTIONAL on the typedef pointer so the null/undefined
                // fast-paths in _validate fire correctly (primBits NULLABLE/OPTIONAL are
                // stripped by `header & SIMPLE` inside K_PRIMITIVE dispatch).
                if (primBits & NULLABLE) { result = (result | NULLABLE) >>> 0; }
                if (primBits & OPTIONAL) { result = (result | OPTIONAL) >>> 0; }
                astCompiled[nodeId] = result;
            } else {
                astCompiled[nodeId] = astFlags[nodeId];
            }
            astState[nodeId] = COMPILED;
            continue;
        }

        /**
         * Bare container types: N_BARE_ARRAY and N_BARE_OBJECT are leaf nodes
         * representing `type: "array"` and `type: "object"` without structural
         * keywords. When no validators are attached, compile to the pre-allocated
         * KINDS constants. Otherwise, allocate a proper entry with the validator.
         */
        if (kind === N_BARE_ARRAY) {
            let vp = compileValidator(nodeId);
            if (vp !== null) {
                /** K_ARRAY inline = ANY|NULLABLE elemType; validator in slot 2. */
                astCompiled[nodeId] = malloc(K_ARRAY | K_VALIDATOR, scratch,
                    (ANY | NULLABLE) >>> 0, null, 0, vp.vHeader, vp.nodePayloads);
            } else {
                astCompiled[nodeId] = BARE_ARRAY;
            }
            astState[nodeId] = COMPILED;
            continue;
        }
        if (kind === N_BARE_OBJECT) {
            let vp = compileValidator(nodeId);
            if (vp !== null) {
                /** Empty slab for zero-property object; validator in slot 2. */
                astCompiled[nodeId] = malloc(K_OBJECT | K_VALIDATOR, scratch,
                    0, [], 0, vp.vHeader, vp.nodePayloads);
            } else {
                astCompiled[nodeId] = BARE_OBJECT;
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

            if (astState[targetId] === VISITING || targetId === nodeId) {
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
                    let count = astChild1[nodeId];
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
                    // propertyNames child (bit 3)
                    if (flags & 8) {
                        stack[sp++] = astEdges[extraOff];
                    }
                    break;
                }
                case N_ARRAY: {
                    stack[sp++] = astChild0[nodeId]; // element type
                    // contains child (bit 1) — compiled to a typedef, then injected
                    // as a V_CONTAINS payload in Visit 2.
                    if (astFlags[nodeId] & 2) {
                        stack[sp++] = astChild1[nodeId];
                    }
                    break;
                }
                case N_OR:
                case N_EXCLUSIVE:
                case N_INTERSECT: {
                    let offset = astChild0[nodeId];
                    let count = astChild1[nodeId];
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
                    let count = astChild1[nodeId];
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
                let count = astChild1[nodeId];
                let resolved = new Array(count * 2);

                for (let i = 0; i < count; i++) {
                    let nameIdx = astEdges[offset + i * 3];
                    let childId = astEdges[offset + i * 3 + 1];
                    let oflags = astEdges[offset + i * 3 + 2];

                    resolved[i * 2] = lookup(propNames[nameIdx]);
                    let compiled = astCompiled[childId] >>> 0;
                    if (oflags) compiled = (compiled | OPTIONAL) >>> 0;
                    resolved[i * 2 + 1] = compiled;
                }
                sortByKeyId(resolved);

                // Read extra edges: additionalProperties + patternProperties + propertyNames
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

                // propertyNames child (bit 3)
                let propertyNamesType = 0;
                if (objFlags & 8) {
                    propertyNamesType = astCompiled[astEdges[extraOff]] >>> 0;
                    extraOff++;
                }

                // Build validator — may need to inject additional sequential payloads.
                // Write order must match runObjectValidator read order:
                //   [fixed-slots] → [V_PAT_PROPS] → [V_PROP_NAMES] → [V_DEP_REQ] → [V_ADD_PROPS]
                let vp = compileValidator(nodeId);
                let finalVHeader = 0;
                let finalPayloads = null;

                if (patPayloads !== null || additionalType !== 0
                    || (astVHeaders[nodeId] & V_ADDITIONAL_PROPERTIES)
                    || (astVHeaders[nodeId] & V_DEPENDENT_REQUIRED)
                    || propertyNamesType !== 0) {
                    let vHeader = astVHeaders[nodeId];
                    let off = astVOffset[nodeId];
                    let pcount = popcnt16(vHeader & 0xFFFF);
                    let nodePayloads = [];

                    // 1. Fixed-slot payloads (V_MIN_PROPERTIES, V_MAX_PROPERTIES via popcnt16)
                    for (let i = 0; i < pcount; i++) {
                        nodePayloads.push(vPayloads[off + i]);
                    }

                    // 2. V_PATTERN_PROPERTIES (variable-length, sequential)
                    if (patPayloads !== null) {
                        // payload: [count, reIdx0, type0, reIdx1, type1, ...]
                        let regexCache = heap.REGEX_CACHE;
                        nodePayloads.push(patPayloads.length / 2);
                        for (let i = 0; i < patPayloads.length; i += 2) {
                            let re = new RegExp(patPayloads[i], 'u');
                            let reIdx = regexCache.length;
                            regexCache.push(re);
                            nodePayloads.push(reIdx);
                            nodePayloads.push(patPayloads[i + 1]);
                        }
                        vHeader |= V_PATTERN_PROPERTIES;
                    }

                    // 3. V_PROPERTY_NAMES (1 slot: compiled typedef)
                    if (propertyNamesType !== 0) {
                        vHeader |= V_PROPERTY_NAMES;
                        nodePayloads.push(propertyNamesType);
                    }

                    // 4. V_DEPENDENT_REQUIRED (variable-length): re-map virtual propNames
                    // indices → real catalog keyIds written by packValidators(virtualLookup).
                    let p = off + pcount;
                    if (vHeader & V_DEPENDENT_REQUIRED) {
                        let numTriggers = vPayloads[p++];
                        nodePayloads.push(numTriggers);
                        for (let ti = 0; ti < numTriggers; ti++) {
                            nodePayloads.push(lookup(propNames[vPayloads[p++]]));
                            let depLen = vPayloads[p++];
                            nodePayloads.push(depLen);
                            for (let di = 0; di < depLen; di++) {
                                nodePayloads.push(lookup(propNames[vPayloads[p++]]));
                            }
                        }
                    }

                    // 5. V_ADDITIONAL_PROPERTIES (1 slot: compiled typedef or 0)
                    if (vHeader & V_ADDITIONAL_PROPERTIES) {
                        nodePayloads.push(additionalType);
                    }

                    finalVHeader = vHeader;
                    finalPayloads = nodePayloads;
                } else if (vp !== null) {
                    finalVHeader = vp.vHeader;
                    finalPayloads = vp.nodePayloads;
                }

                let hasVal = finalPayloads !== null;
                let kindHeader = hasVal ? (K_OBJECT | K_VALIDATOR) : K_OBJECT;
                astCompiled[nodeId] = malloc(kindHeader, scratch, 0,
                    resolved, count, hasVal ? finalVHeader : 0, finalPayloads);
                break;
            }

            case N_ARRAY: {
                let elemType = astCompiled[astChild0[nodeId]];
                let vp = compileValidator(nodeId);

                // Inject V_CONTAINS payload when a contains child is present (astFlags bit 1).
                // runArrayValidator uses popcnt16(vHeader & (V_CONTAINS - 1)) to locate the
                // contains slot, so we insert the compiled typedef at that same offset.
                if (astFlags[nodeId] & 2) {
                    let containsType = astCompiled[astChild1[nodeId]] >>> 0;
                    if (vp === null) {
                        vp = { vHeader: V_CONTAINS, nodePayloads: [containsType] };
                    } else {
                        let insertAt = popcnt16(vp.vHeader & (V_CONTAINS - 1));
                        let old = vp.nodePayloads;
                        let neo = new Array(old.length + 1);
                        for (let i = 0; i < insertAt; i++) {
                            neo[i] = old[i];
                        }
                        neo[insertAt] = containsType;
                        for (let i = insertAt; i < old.length; i++) {
                            neo[i + 1] = old[i];
                        }
                        vp.nodePayloads = neo;
                        vp.vHeader |= V_CONTAINS;
                    }
                }

                let kindHeader = (vp !== null) ? (K_ARRAY | K_VALIDATOR) : K_ARRAY;
                /** K_ARRAY inline = elemType (KINDS slot 1); no SHAPES entry. */
                astCompiled[nodeId] = malloc(kindHeader, scratch, elemType >>> 0,
                    null, 0, vp !== null ? vp.vHeader : 0, vp !== null ? vp.nodePayloads : null);
                break;
            }

            case N_OR: {
                let offset = astChild0[nodeId];
                let count = astChild1[nodeId];
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
                    let result = malloc(K_OR, scratch, 0, types, types.length, 0, null);
                    for (let i = 0; i < types.length; i++) {
                        if (types[i] & NULLABLE) result |= NULLABLE;
                        if (types[i] & OPTIONAL) result |= OPTIONAL;
                    }
                    astCompiled[nodeId] = result >>> 0;
                }
                break;
            }

            case N_EXCLUSIVE: {
                let offset = astChild0[nodeId];
                let count = astChild1[nodeId];
                let types = new Array(count);
                for (let i = 0; i < count; i++) {
                    types[i] = astCompiled[astEdges[offset + i]];
                }
                astCompiled[nodeId] = malloc(K_EXCLUSIVE, scratch, 0, types, types.length, 0, null);
                break;
            }

            case N_INTERSECT: {
                let offset = astChild0[nodeId];
                let count = astChild1[nodeId];
                let types = new Array(count);
                for (let i = 0; i < count; i++) {
                    types[i] = astCompiled[astEdges[offset + i]];
                }
                astCompiled[nodeId] = malloc(K_INTERSECT, scratch, 0, types, types.length, 0, null);
                break;
            }

            case N_NOT: {
                let innerType = astCompiled[astChild0[nodeId]];
                astCompiled[nodeId] = malloc(K_NOT, scratch, innerType >>> 0, null, 0, 0, null);
                break;
            }

            case N_CONDITIONAL: {
                let base = astChild0[nodeId];
                let ifType = astCompiled[astEdges[base]];
                let thenType = astEdges[base + 1] !== SENTINEL ? astCompiled[astEdges[base + 1]] : 0;
                let elseType = astEdges[base + 2] !== SENTINEL ? astCompiled[astEdges[base + 2]] : 0;
                let types = [ifType, thenType, elseType];
                astCompiled[nodeId] = malloc(K_CONDITIONAL, scratch, 0, types, types.length, 0, null);
                break;
            }

            case N_TUPLE: {
                let offset = astChild0[nodeId];
                let count = astChild1[nodeId];
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
                let vp = compileValidator(nodeId);
                let kindHeader = (vp !== null) ? (K_TUPLE | K_VALIDATOR) : K_TUPLE;
                astCompiled[nodeId] = malloc(kindHeader, scratch, 0,
                    types, totalCount, vp !== null ? vp.vHeader : 0, vp !== null ? vp.nodePayloads : null);
                break;
            }

            case N_REFINE: {
                let innerType = astCompiled[astChild0[nodeId]];
                let cbIdx = astChild1[nodeId];
                let callbackIdx = HEAP.CALLBACKS.push(callbacks[cbIdx]) - 1;
                /** Store [innerType, callbackIdx] on SLAB; KINDS slot 1 = SHAPES index. */
                let slabData = new Uint32Array(2);
                slabData[0] = innerType >>> 0;
                slabData[1] = callbackIdx;
                let result = malloc(K_REFINE, scratch, 0, slabData, 2, 0, null);
                if (innerType & NULLABLE) result |= NULLABLE;
                if (innerType & OPTIONAL) result |= OPTIONAL;
                astCompiled[nodeId] = result >>> 0;
                break;
            }
        }
        astState[nodeId] = COMPILED;
    }

    // ── Patch circular $ref dependencies ──
    for (let i = 0; i < circularPatches.length; i++) {
        let [refNodeId, targetId, kindPtr] = circularPatches[i];
        let compiled = astCompiled[targetId];
        if ((compiled & COMPLEX) === 0) {
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

    /** @type {uvd.SchemaResource<T,R>[]} */
    let resources = [];

    for (let i = 0; i < rootIds.length; i++) {
        let nodeId = rootIds[i];
        let heapOffset = astCompiled[nodeId];

        resources.push({
            uri: rootUris[i] || `urn:uuid:schema-${i}`,
            id: rootUris[i] || null,
            anchor: null,
            schema: /** @type {uvd.Type<T,R>} */(heapOffset),
            name: rootNames[i] || null
        });
    }

    return resources;
}
