/// <reference path="../global.d.ts" />
import {
    COMPLEX, NULLABLE, OPTIONAL, VOLATILE,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_UNION, K_REFINE, K_TUPLE,
    K_RECORD, K_OR, K_EXCLUSIVE, K_INTERSECT, K_NOT, K_CONDITIONAL,
    HAS_VALIDATOR, sortByKeyId,
} from "./catalog.js";

import { popcnt16 } from "./const.js";

import {
    N_PRIM, N_OBJECT, N_ARRAY, N_REFINE, N_OR,
    N_EXCLUSIVE, N_INTERSECT, N_NOT, N_CONDITIONAL, N_REF,
} from "./schema.js";

const KIND_MASK = 0x0FFFFFFF;
const MAX_DEPTH = 512;

// Compiler states
const UNVISITED = 0;
const VISITING = 1;
const COMPILED = 2;

/**
 * Compiles a FlatAst into the catalog's heap storage.
 * Uses an iterative state machine with an explicit stack.
 * @template {symbol} R
 * @param {uvd.cat.Catalog<R>} cat - a catalog instance returned by catalog()
 * @param {uvd.ast.FlatAst} ast
 * @returns {uvd.ast.CompiledSchema}
 */
export function compile(cat, ast) {
    let heap = cat.__heap;
    let HEAP = heap.HEAP;
    let allocKind = heap.allocKind;
    let allocValidator = heap.allocValidator;
    let allocOnSlab = heap.allocOnSlab;
    let lookup = heap.lookup;
    let registerObject = heap.registerObject;
    let registerArray = heap.registerArray;
    let registerUnion = heap.registerUnion;

    let volatile = false;

    let {
        astKinds, astFlags, astChild0, astChild1,
        astVHeaders, astVOffset, vPayloads,
        propNames, propChildren, propFlags, listChildren, condSlots, callbacks,
        rootId, defIds, defNames, nodeCount,
    } = ast;

    // Compiler-owned arrays
    let astState = new Uint8Array(nodeCount);
    let astCompiled = new Uint32Array(nodeCount);

    // Track circular refs for patching: [refNodeId, targetNodeId, reservedKindPtr]
    /** @type {Array<[number, number, number]>} */
    let circularPatches = [];

    // Explicit stack
    let stack = new Uint32Array(MAX_DEPTH);
    let sp = 0;

    // Push all defs first so they're compiled
    for (let i = 0; i < defIds.length; i++) {
        stack[sp++] = defIds[i];
    }
    // Push root
    stack[sp++] = rootId;

    while (sp > 0) {
        let nodeId = stack[--sp];

        if (astState[nodeId] === COMPILED) continue;

        let kind = astKinds[nodeId];

        // --- Primitives: compile immediately ---
        if (kind === N_PRIM) {
            let vHeader = astVHeaders[nodeId];
            if (vHeader !== 0) {
                let off = astVOffset[nodeId];
                let count = popcnt16(vHeader & 0xFFFF);
                let nodePayloads = new Array(count);
                for (let i = 0; i < count; i++) {
                    nodePayloads[i] = vPayloads[off + i];
                }
                let valIdx = allocValidator(vHeader, nodePayloads, volatile);
                let primBits = astFlags[nodeId];
                let kindHeader = K_PRIMITIVE | HAS_VALIDATOR | primBits;
                let kindPtr = allocKind(kindHeader, valIdx, volatile, 2);
                astCompiled[nodeId] = (COMPLEX | kindPtr) >>> 0;
            } else {
                astCompiled[nodeId] = astFlags[nodeId];
            }
            astState[nodeId] = COMPILED;
            continue;
        }

        // --- Refs ---
        if (kind === N_REF) {
            let targetId = astChild0[nodeId];

            if (astState[nodeId] === VISITING) {
                // Scenario D: we were waiting, target should be done now
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

            // First time seeing this ref
            if (astState[targetId] === COMPILED) {
                // Scenario A: target already compiled
                astCompiled[nodeId] = astCompiled[targetId];
                astState[nodeId] = COMPILED;
                continue;
            }

            if (astState[targetId] === VISITING) {
                // Scenario B: circular dependency
                let kindPtr = HEAP.KIND_PTR;
                HEAP.KIND_PTR += 2;
                astCompiled[nodeId] = (COMPLEX | kindPtr) >>> 0;
                astState[nodeId] = COMPILED;
                circularPatches.push([nodeId, targetId, kindPtr]);
                continue;
            }

            // Scenario C: target unvisited — push self back, then target
            astState[nodeId] = VISITING;
            stack[sp++] = nodeId;
            stack[sp++] = targetId;
            continue;
        }

        // --- Complex nodes: two-visit pattern ---
        if (astState[nodeId] === UNVISITED) {
            // First visit: mark as visiting, push self back, push children
            astState[nodeId] = VISITING;
            stack[sp++] = nodeId;

            switch (kind) {
                case N_OBJECT: {
                    let offset = astChild0[nodeId];
                    let count = astChild1[nodeId];
                    for (let i = 0; i < count; i++) {
                        stack[sp++] = propChildren[offset + i];
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
                    let count = astChild1[nodeId];
                    for (let i = 0; i < count; i++) {
                        stack[sp++] = listChildren[offset + i];
                    }
                    break;
                }
                case N_NOT: {
                    stack[sp++] = astChild0[nodeId];
                    break;
                }
                case N_CONDITIONAL: {
                    let condOffset = astChild0[nodeId];
                    // Push in reverse so if is compiled first
                    if (condSlots[condOffset + 2] !== 0xFFFFFFFF) stack[sp++] = condSlots[condOffset + 2]; // else
                    if (condSlots[condOffset + 1] !== 0xFFFFFFFF) stack[sp++] = condSlots[condOffset + 1]; // then
                    stack[sp++] = condSlots[condOffset]; // if
                    break;
                }
                case N_REFINE: {
                    stack[sp++] = astChild0[nodeId]; // inner type
                    break;
                }
            }
            continue;
        }

        // --- Second visit (VISITING): all children compiled, now compile this node ---
        switch (kind) {
            case N_OBJECT: {
                let offset = astChild0[nodeId];
                let count = astChild1[nodeId];
                let resolved = new Array(count * 2);
                for (let i = 0; i < count; i++) {
                    resolved[i * 2] = lookup(propNames[offset + i]);
                    let compiled = astCompiled[propChildren[offset + i]] >>> 0;
                    if (propFlags && propFlags[offset + i]) {
                        compiled = (compiled | OPTIONAL) >>> 0;
                    }
                    resolved[i * 2 + 1] = compiled;
                }
                sortByKeyId(resolved);

                let objId = registerObject(resolved, count, volatile);
                let vHeader = astVHeaders[nodeId];
                let hasVal = vHeader !== 0;
                let valIdx = 0;
                if (hasVal) {
                    let off = astVOffset[nodeId];
                    let pCount = popcnt16(vHeader & 0xFFFF);
                    let nodePayloads = new Array(pCount);
                    for (let j = 0; j < pCount; j++) {
                        nodePayloads[j] = vPayloads[off + j];
                    }
                    valIdx = allocValidator(vHeader, nodePayloads, volatile);
                }
                let kindHeader = hasVal ? (K_OBJECT | HAS_VALIDATOR) : K_OBJECT;
                let slots = hasVal ? 3 : 2;
                let kindPtr = allocKind(kindHeader, objId, volatile, slots);
                if (hasVal) {
                    HEAP.KINDS[kindPtr + 2] = valIdx;
                }
                astCompiled[nodeId] = (COMPLEX | kindPtr) >>> 0;
                break;
            }

            case N_ARRAY: {
                let elemType = astCompiled[astChild0[nodeId]];
                let arrId = registerArray(elemType, volatile);
                let vHeader = astVHeaders[nodeId];
                let hasVal = vHeader !== 0;
                let valIdx = 0;
                if (hasVal) {
                    let off = astVOffset[nodeId];
                    let pCount = popcnt16(vHeader & 0xFFFF);
                    let nodePayloads = new Array(pCount);
                    for (let j = 0; j < pCount; j++) {
                        nodePayloads[j] = vPayloads[off + j];
                    }
                    valIdx = allocValidator(vHeader, nodePayloads, volatile);
                }
                let kindHeader = hasVal ? (K_ARRAY | HAS_VALIDATOR) : K_ARRAY;
                let slots = hasVal ? 3 : 2;
                let kindPtr = allocKind(kindHeader, arrId, volatile, slots);
                if (hasVal) {
                    HEAP.KINDS[kindPtr + 2] = valIdx;
                }
                astCompiled[nodeId] = (COMPLEX | kindPtr) >>> 0;
                break;
            }

            case N_OR: {
                let offset = astChild0[nodeId];
                let count = astChild1[nodeId];
                let types = new Array(count);
                let allPrimitive = true;
                let merged = 0;
                for (let i = 0; i < count; i++) {
                    types[i] = astCompiled[listChildren[offset + i]];
                    if (types[i] & COMPLEX) {
                        allPrimitive = false;
                    } else {
                        merged |= types[i];
                    }
                }
                if (allPrimitive) {
                    astCompiled[nodeId] = merged >>> 0;
                } else {
                    let matchId = allocOnSlab(types, volatile, 'match');
                    let kindPtr = allocKind(K_OR, matchId, volatile, 2);
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
                let count = astChild1[nodeId];
                let types = new Array(count);
                for (let i = 0; i < count; i++) {
                    types[i] = astCompiled[listChildren[offset + i]];
                }
                let matchId = allocOnSlab(types, volatile, 'match');
                let kindPtr = allocKind(K_EXCLUSIVE, matchId, volatile, 2);
                astCompiled[nodeId] = (COMPLEX | kindPtr) >>> 0;
                break;
            }

            case N_INTERSECT: {
                let offset = astChild0[nodeId];
                let count = astChild1[nodeId];
                let types = new Array(count);
                for (let i = 0; i < count; i++) {
                    types[i] = astCompiled[listChildren[offset + i]];
                }
                let matchId = allocOnSlab(types, volatile, 'match');
                let kindPtr = allocKind(K_INTERSECT, matchId, volatile, 2);
                astCompiled[nodeId] = (COMPLEX | kindPtr) >>> 0;
                break;
            }

            case N_NOT: {
                let innerType = astCompiled[astChild0[nodeId]];
                let kindPtr = allocKind(K_NOT, innerType >>> 0, volatile, 2);
                astCompiled[nodeId] = (COMPLEX | kindPtr) >>> 0;
                break;
            }

            case N_CONDITIONAL: {
                let condOffset = astChild0[nodeId];
                let ifType = astCompiled[condSlots[condOffset]];
                let thenType = condSlots[condOffset + 1] !== 0xFFFFFFFF
                    ? astCompiled[condSlots[condOffset + 1]] : 0;
                let elseType = condSlots[condOffset + 2] !== 0xFFFFFFFF
                    ? astCompiled[condSlots[condOffset + 2]] : 0;
                let types = [ifType, thenType, elseType];
                let matchId = allocOnSlab(types, volatile, 'match');
                let kindPtr = allocKind(K_CONDITIONAL, matchId, volatile, 2);
                astCompiled[nodeId] = (COMPLEX | kindPtr) >>> 0;
                break;
            }

            case N_REFINE: {
                let innerType = astCompiled[astChild0[nodeId]];
                let cbIdx = astChild1[nodeId];
                let callbacksArr = HEAP.CALLBACKS;
                let callbackIdx = callbacksArr.push(callbacks[cbIdx]) - 1;
                let kindPtr = allocKind(K_REFINE, innerType >>> 0, volatile, 3);
                HEAP.KINDS[kindPtr + 2] = callbackIdx;
                let flags = COMPLEX | kindPtr;
                if (innerType & NULLABLE) {
                    flags |= NULLABLE;
                }
                if (innerType & OPTIONAL) {
                    flags |= OPTIONAL;
                }
                astCompiled[nodeId] = flags >>> 0;
                break;
            }
        }
        astState[nodeId] = COMPILED;
    }

    // --- Patch circular references ---
    for (let i = 0; i < circularPatches.length; i++) {
        let [refNodeId, targetId, kindPtr] = circularPatches[i];
        let compiled = astCompiled[targetId];
        if (typeof compiled === 'number' && (compiled & COMPLEX) === 0) {
            // Raw primitive → promote to K_PRIMITIVE
            HEAP.KINDS[kindPtr] = K_PRIMITIVE | compiled;
            HEAP.KINDS[kindPtr + 1] = 0;
        } else {
            // Complex type → copy the real kind entry
            let realPtr = compiled & KIND_MASK;
            HEAP.KINDS[kindPtr] = HEAP.KINDS[realPtr];
            HEAP.KINDS[kindPtr + 1] = HEAP.KINDS[realPtr + 1];
        }
    }

    // Build result
    /** @type {Record<string, number>} */
    let resultDefs = {};
    for (let i = 0; i < defNames.length; i++) {
        resultDefs[defNames[i]] = astCompiled[defIds[i]];
    }

    return { root: astCompiled[rootId], defs: resultDefs };
}
