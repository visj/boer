/// <reference path="../../global.d.ts" />
import {
    COMPLEX, NULLABLE, OPTIONAL,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_RECORD,
    K_OR, K_EXCLUSIVE, K_INTERSECT,
    K_UNION, K_TUPLE, K_REFINE, K_NOT,
    K_CONDITIONAL, K_DYN_ANCHOR, K_DYN_REF, K_UNEVALUATED,
    K_VALIDATOR, sortByKeyId,
    BARE_ARRAY, BARE_OBJECT, BARE_RECORD
} from "./catalog.js";

import {
    popcnt16, ANY, STRING, NUMBER, INTEGER, BOOLEAN, VALUE, PRIM_MASK,
    K_ANY_INNER, V_PATTERN, V_PATTERN_PROPERTIES, V_ADDITIONAL_PROPERTIES,
    V_DEPENDENT_REQUIRED, V_DEPENDENT_SCHEMAS, V_ENUM, V_CONTAINS,
    V_PROPERTY_NAMES, K_HAS_ITEMS, K_HAS_REST,
    MODIFIER, MOD_ARRAY, MOD_RECORD, MOD_ENUM,
    V_MIN_LENGTH, V_MAX_LENGTH, V_FORMAT, K_ALL_REQUIRED,
    V_MINIMUM, V_MAXIMUM, V_MULTIPLE_OF, V_EXCLUSIVE_MINIMUM, V_EXCLUSIVE_MAXIMUM,
    V_MIN_ITEMS, V_MAX_ITEMS, V_MIN_CONTAINS, V_MAX_CONTAINS, V_UNIQUE_ITEMS,
} from "./const.js";

import {
    N_PRIM, N_OBJECT, N_ARRAY, N_REFINE, N_OR,
    N_EXCLUSIVE, N_INTERSECT, N_NOT, N_CONDITIONAL, N_TUPLE, N_REF,
    N_BARE_ARRAY, N_BARE_OBJECT, N_DYN_ANCHOR, N_DYN_REF, N_UNEVALUATED,
    AST_FLAG_HAS_REST, AST_FLAG_HAS_CONTAINS
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

    // Circular $dynamicRef patches: [targetNodeId, dynRefTypedef]
    // After compilation, we patch the fallback type in the SLAB.
    /** @type {Array<[number, number]>} */
    let dynRefPatches = [];

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

                /**
                 * Try inline encoding for simple primitive validators.
                 * Must be a single type (not multi-type union), no V_ENUM,
                 * no V_FORMAT, and values must fit in the bit ranges.
                 */
                let typeBits = primBits & 0xF8;
                let isSingleType = typeBits !== 0 && (typeBits & (typeBits - 1)) === 0;
                let canTryInline = isSingleType && !(vHeader & V_ENUM) && !(primBits & ANY);

                if (canTryInline && (typeBits === STRING)) {
                    /** Try inline STRING: regexIdx(8b), maxLength(8b), minLength(5b) */
                    let canInline = !(vHeader & V_FORMAT);
                    let regexIdx = 0;
                    let minLen = 0;
                    let maxLen = 0;
                    if (canInline && (vHeader & V_PATTERN)) {
                        let slot = popcnt16(vHeader & (V_PATTERN - 1));
                        let raw = vPayloads[off + slot];
                        regexIdx = heap.REGEX_CACHE.push(regexes[raw]) - 1;
                        if (regexIdx > 255) {
                            canInline = false;
                        }
                    }
                    if (canInline && (vHeader & V_MIN_LENGTH)) {
                        let slot = popcnt16(vHeader & (V_MIN_LENGTH - 1));
                        minLen = vPayloads[off + slot] | 0;
                        if (minLen === 0 || minLen > 31) {
                            canInline = false;
                        }
                    }
                    if (canInline && (vHeader & V_MAX_LENGTH)) {
                        let slot = popcnt16(vHeader & (V_MAX_LENGTH - 1));
                        maxLen = vPayloads[off + slot] | 0;
                        if (maxLen === 0 || maxLen > 255) {
                            canInline = false;
                        }
                    }
                    if (canInline && (regexIdx > 0 || minLen > 0 || maxLen > 0)) {
                        let result = STRING | (regexIdx << 9) | (maxLen << 17) | (minLen << 25);
                        if (primBits & NULLABLE) { result |= NULLABLE; }
                        if (primBits & OPTIONAL) { result |= OPTIONAL; }
                        astCompiled[nodeId] = result;
                        astState[nodeId] = COMPILED;
                        continue;
                    }
                }

                if (canTryInline && (typeBits === NUMBER || typeBits === INTEGER)) {
                    /**
                     * Try inline NUMBER/INTEGER: exclMin(1b), exclMax(1b),
                     * minNeg(1b), maxNeg(1b), minMag(9b), maxMag(8b).
                     * Only integer bounds can be inlined. Float or multipleOf → fallback.
                     */
                    let canInline = !(vHeader & V_MULTIPLE_OF);
                    let exclMin = 0;
                    let exclMax = 0;
                    let minNeg = 0;
                    let maxNeg = 0;
                    let minMag = 0;
                    let maxMag = 0;

                    if (canInline && (vHeader & V_MINIMUM)) {
                        let slot = popcnt16(vHeader & (V_MINIMUM - 1));
                        let val = vPayloads[off + slot];
                        if (!Number.isInteger(val) || val === 0) {
                            canInline = false;
                        } else {
                            let abs = Math.abs(val);
                            if (abs > 511) {
                                canInline = false;
                            } else {
                                minNeg = val < 0 ? 1 : 0;
                                minMag = abs;
                                if (vHeader & V_EXCLUSIVE_MINIMUM) {
                                    exclMin = 1;
                                }
                            }
                        }
                    }
                    if (canInline && (vHeader & V_MAXIMUM)) {
                        let slot = popcnt16(vHeader & (V_MAXIMUM - 1));
                        let val = vPayloads[off + slot];
                        if (!Number.isInteger(val) || val === 0) {
                            canInline = false;
                        } else {
                            let abs = Math.abs(val);
                            if (abs > 255) {
                                canInline = false;
                            } else {
                                maxNeg = val < 0 ? 1 : 0;
                                maxMag = abs;
                                if (vHeader & V_EXCLUSIVE_MAXIMUM) {
                                    exclMax = 1;
                                }
                            }
                        }
                    }
                    if (canInline && (minMag > 0 || maxMag > 0)) {
                        let result = typeBits
                            | (exclMin << 9) | (exclMax << 10)
                            | (minNeg << 11) | (maxNeg << 12)
                            | (minMag << 13) | (maxMag << 22);
                        if (primBits & NULLABLE) { result |= NULLABLE; }
                        if (primBits & OPTIONAL) { result |= OPTIONAL; }
                        astCompiled[nodeId] = result;
                        astState[nodeId] = COMPILED;
                        continue;
                    }
                }

                /** Fallback: allocate K_PRIMITIVE + VALIDATORS on the heap
                 * MOD_ENUM fast path: when V_ENUM is the ONLY validator (no min/max/pattern/format)
                 * and the enum is single-type (strings only or numbers only),
                 * compile directly to an inline MOD_ENUM typedef using Set.has().
                 * This avoids the K_PRIMITIVE → KINDS → runPrimValidator → binary search chain.
                 */
                let enumOnly = (vHeader & V_ENUM) && fixedCount === 0;
                if (enumOnly) {
                    let p = off;
                    let valueBits = primBits & VALUE;
                    let hasNull = (primBits & NULLABLE) !== 0;
                    let hasUndef = (primBits & OPTIONAL) !== 0;

                    /** String-only enum: build a Set of the raw string values. */
                    if (valueBits === STRING) {
                        let strCount = vPayloads[p++] | 0;
                        let set = new Set();
                        for (let i = 0; i < strCount; i++) {
                            set.add(propNames[vPayloads[p++] | 0]);
                        }
                        let idx = heap.allocEnumSet(set);
                        if (idx <= 0xFFFFF) {
                            let result = STRING | MODIFIER | MOD_ENUM | (1 << 11) | (idx << 12);
                            if (hasNull) {
                                result = result | NULLABLE;
                            }
                            if (hasUndef) {
                                result = result | OPTIONAL;
                            }
                            astCompiled[nodeId] = result;
                            astState[nodeId] = COMPILED;
                            continue;
                        }
                    }

                    /** Number-only enum: build a Set of the raw number values. */
                    if (valueBits === NUMBER || valueBits === INTEGER || valueBits === (NUMBER | INTEGER)) {
                        /** Skip string segment if present (shouldn't be for number-only) */
                        if (primBits & STRING) {
                            let strCount = vPayloads[p++] | 0;
                            p += strCount;
                        }
                        let numCount = vPayloads[p++] | 0;
                        let set = new Set();
                        for (let i = 0; i < numCount; i++) {
                            set.add(vPayloads[p++]);
                        }
                        let idx = heap.allocEnumSet(set);
                        if (idx <= 0xFFFFF) {
                            let innerBits = (valueBits & INTEGER) ? INTEGER : NUMBER;
                            let result = innerBits | MODIFIER | MOD_ENUM | (1 << 11) | (idx << 12);
                            if (hasNull) {
                                result = result | NULLABLE;
                            }
                            if (hasUndef) {
                                result = result | OPTIONAL;
                            }
                            astCompiled[nodeId] = result;
                            astState[nodeId] = COMPILED;
                            continue;
                        }
                    }
                }

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
                let valIdx = allocValidator(vHeader, nodePayloads);
                /**
                 * Strip ANY (bit 3) from the KINDS header bits to avoid K_TUPLE (=8)
                 * collision with KIND_ENUM_MASK. Store only VALUE bits (4-7) in the header.
                 * Signal the ANY case via K_ANY_INNER instead.
                 */
                let kindHeaderBits = primBits & VALUE;
                let kindFlags = K_PRIMITIVE | K_VALIDATOR | kindHeaderBits;
                if (primBits & ANY) { kindFlags = (kindFlags | K_ANY_INNER) >>> 0; }
                let result = malloc(kindFlags, valIdx, null, 0, 0, null);
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
                astCompiled[nodeId] = malloc(K_ARRAY | K_VALIDATOR,
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
                astCompiled[nodeId] = malloc(K_OBJECT | K_VALIDATOR,
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
                /**
                 * New encoding: COMPLEX bit at 0, KINDS index in bits 3+.
                 * Must use (1 | (kindPtr << 3)) not (COMPLEX | kindPtr).
                 */
                astCompiled[nodeId] = (1 | (kindPtr << 3)) >>> 0;
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

        // ── $dynamicRef resolution ──
        // Like N_REF but emits a K_DYN_REF node with [anchorKeyId, fallbackType].
        if (kind === N_DYN_REF) {
            let targetId = astChild0[nodeId];

            if (astState[nodeId] === VISITING) {
                // Re-visit: target should be compiled by now — emit K_DYN_REF
                if (astState[targetId] === COMPILED) {
                    let fallbackType = astCompiled[targetId] >>> 0;
                    let nameIdx = astChild1[nodeId];
                    let anchorKeyId = lookup(propNames[nameIdx]);
                    let slabData = new Uint32Array(2);
                    slabData[0] = anchorKeyId;
                    slabData[1] = fallbackType;
                    astCompiled[nodeId] = malloc(K_DYN_REF, 0, slabData, 2, 0, null);
                    astState[nodeId] = COMPILED;
                } else {
                    stack[sp++] = nodeId;
                    stack[sp++] = targetId;
                }
                continue;
            }

            // First visit
            if (astState[targetId] === COMPILED) {
                let fallbackType = astCompiled[targetId] >>> 0;
                let nameIdx = astChild1[nodeId];
                let anchorKeyId = lookup(propNames[nameIdx]);
                let slabData = new Uint32Array(2);
                slabData[0] = anchorKeyId;
                slabData[1] = fallbackType;
                astCompiled[nodeId] = malloc(K_DYN_REF, 0, slabData, 2, 0, null);
                astState[nodeId] = COMPILED;
                continue;
            }

            if (astState[targetId] === VISITING || targetId === nodeId) {
                // Circular dependency — allocate K_DYN_REF immediately with a
                // placeholder fallback (0). We patch the fallback in the SLAB
                // after all nodes are compiled.
                let nameIdx = astChild1[nodeId];
                let anchorKeyId = lookup(propNames[nameIdx]);
                let slabData = new Uint32Array(2);
                slabData[0] = anchorKeyId;
                slabData[1] = 0; // placeholder fallback
                let result = malloc(K_DYN_REF, 0, slabData, 2, 0, null);
                astCompiled[nodeId] = result;
                astState[nodeId] = COMPILED;
                dynRefPatches.push([targetId, result]);
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
                        extraOff++;
                    }
                    // dependentSchemas children (bit 4)
                    if (flags & 16) {
                        let depCount = astEdges[extraOff++];
                        for (let i = 0; i < depCount; i++) {
                            extraOff++; // skip trigger key name index
                            stack[sp++] = astEdges[extraOff++]; // child id
                        }
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
                    let extraOffset = offset + count;
                    // rest type child (bit 0)
                    if (astFlags[nodeId] & AST_FLAG_HAS_REST) {
                        stack[sp++] = astEdges[extraOffset++];
                    }
                    if (astFlags[nodeId] & AST_FLAG_HAS_CONTAINS) {
                        stack[sp++] = astEdges[extraOffset];
                    }
                    break;
                }
                case N_REFINE: {
                    stack[sp++] = astChild0[nodeId]; // inner type
                    break;
                }
                case N_DYN_ANCHOR: {
                    stack[sp++] = astChild0[nodeId]; // inner type
                    let edgeBase = astFlags[nodeId];
                    let pairCount = astChild1[nodeId];
                    for (let i = 0; i < pairCount; i++) {
                        stack[sp++] = astEdges[edgeBase + i * 2 + 1]; // target node ids
                    }
                    break;
                }
                case N_UNEVALUATED: {
                    stack[sp++] = astChild0[nodeId]; // inner type
                    stack[sp++] = astChild1[nodeId]; // unevalSchema child
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
                /**
                 * Track whether propertyNames was provided separately from its compiled value.
                 * We cannot use `propertyNamesType !== 0` because `false` schema compiles to
                 * NEVER = 0, which would be indistinguishable from "not provided".
                 */
                let hasPropertyNames = false;
                if (objFlags & 8) {
                    propertyNamesType = astCompiled[astEdges[extraOff]] >>> 0;
                    hasPropertyNames = true;
                    extraOff++;
                }

                // dependentSchemas children (bit 4)
                /** @type {Array<number>|null} */
                let depSchemaPayloads = null;
                if (objFlags & 16) {
                    let depCount = astEdges[extraOff++];
                    depSchemaPayloads = [depCount];
                    for (let i = 0; i < depCount; i++) {
                        let trigNameIdx = astEdges[extraOff++];
                        let depChildId = astEdges[extraOff++];
                        depSchemaPayloads.push(lookup(propNames[trigNameIdx]));
                        depSchemaPayloads.push(astCompiled[depChildId] >>> 0);
                    }
                }

                // Build validator — may need to inject additional sequential payloads.
                // Write order must match runObjectValidator read order:
                //   [fixed-slots] → [V_PAT_PROPS] → [V_PROP_NAMES] → [V_DEP_REQ] → [V_DEP_SCHEMAS] → [V_ADD_PROPS]
                let vp = compileValidator(nodeId);
                let finalVHeader = 0;
                let finalPayloads = null;

                if (patPayloads !== null || additionalType !== 0
                    || (astVHeaders[nodeId] & V_ADDITIONAL_PROPERTIES)
                    || (astVHeaders[nodeId] & V_DEPENDENT_REQUIRED)
                    || hasPropertyNames
                    || depSchemaPayloads !== null) {
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
                    if (hasPropertyNames) {
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

                    // 5. V_DEPENDENT_SCHEMAS (variable-length): [count, keyId, type, ...]
                    if (depSchemaPayloads !== null) {
                        vHeader |= V_DEPENDENT_SCHEMAS;
                        for (let i = 0; i < depSchemaPayloads.length; i++) {
                            nodePayloads.push(depSchemaPayloads[i]);
                        }
                    }

                    // 6. V_ADDITIONAL_PROPERTIES (1 slot: compiled typedef or 0)
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
                /** Check if all properties are required for K_ALL_REQUIRED fast path */
                let allRequired = true;
                for (let i = 1; i < resolved.length; i += 2) {
                    if (resolved[i] & OPTIONAL) {
                        allRequired = false;
                        break;
                    }
                }
                if (allRequired) {
                    kindHeader = kindHeader | K_ALL_REQUIRED;
                }
                astCompiled[nodeId] = malloc(kindHeader, 0,
                    resolved, count, hasVal ? finalVHeader : 0, finalPayloads);
                break;
            }

            case N_ARRAY: {
                let elemType = astCompiled[astChild0[nodeId]];
                let vp = compileValidator(nodeId);

                // Inject V_CONTAINS payload when a contains child is present (astFlags bit 1).
                // runArrayValidator uses popcnt16(vHeader & (V_CONTAINS - 1)) to locate the
                // contains slot, so we insert the compiled typedef at that same offset.
                let hasContains = (astFlags[nodeId] & 2) !== 0;
                if (hasContains) {
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

                /**
                 * MOD_ARRAY inlining is NOT done in the AST compiler because JSON Schema
                 * supports unevaluatedItems which requires tracking via trackPtr/snapPtr.
                 * Inline MOD_ARRAY bypasses this tracking. The DSL path in allocate.js
                 * can inline safely since the DSL doesn't expose unevaluated tracking.
                 */
                let hasItems = (astFlags[nodeId] & 4) !== 0;

                let kindHeader = (vp !== null) ? (K_ARRAY | K_VALIDATOR) : K_ARRAY;
                if (hasItems) {
                    kindHeader |= K_HAS_ITEMS;
                }

                /** K_ARRAY inline = elemType (KINDS slot 1); no SHAPES entry. */
                astCompiled[nodeId] = malloc(kindHeader, elemType >>> 0,
                    null, 0, vp !== null ? vp.vHeader : 0, vp !== null ? vp.nodePayloads : null);
                break;
            }

            case N_OR: {
                let offset = astChild0[nodeId];
                let count = astChild1[nodeId];
                let types = new Array(count);
                let allBarePrimitive = true;
                let merged = 0;
                for (let i = 0; i < count; i++) {
                    types[i] = astCompiled[astEdges[offset + i]];
                    if ((types[i] & COMPLEX) || types[i] > 0xFF) {
                        allBarePrimitive = false;
                    } else {
                        merged |= types[i];
                    }
                }
                if (allBarePrimitive) {
                    astCompiled[nodeId] = merged >>> 0;
                } else {
                    let result = malloc(K_OR, 0, types, types.length, 0, null);
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
                astCompiled[nodeId] = malloc(K_EXCLUSIVE, 0, types, types.length, 0, null);
                break;
            }

            case N_INTERSECT: {
                let offset = astChild0[nodeId];
                let count = astChild1[nodeId];
                let types = new Array(count);
                for (let i = 0; i < count; i++) {
                    types[i] = astCompiled[astEdges[offset + i]];
                }
                astCompiled[nodeId] = malloc(K_INTERSECT, 0, types, types.length, 0, null);
                break;
            }

            case N_NOT: {
                let innerType = astCompiled[astChild0[nodeId]];
                astCompiled[nodeId] = malloc(K_NOT, innerType >>> 0, null, 0, 0, null);
                break;
            }

            case N_CONDITIONAL: {
                let base = astChild0[nodeId];
                let ifType = astCompiled[astEdges[base]];
                /**
                 * Use ANY|NULLABLE|OPTIONAL (= 14) as the "absent branch" sentinel.
                 * We cannot use 0 because NEVER = 0 (false schema) also produces 0,
                 * and K_CONDITIONAL must distinguish "no constraint" from "reject all".
                 */
                let absentBranch = (ANY | NULLABLE | OPTIONAL) >>> 0;
                let thenType = astEdges[base + 1] !== SENTINEL ? astCompiled[astEdges[base + 1]] : absentBranch;
                let elseType = astEdges[base + 2] !== SENTINEL ? astCompiled[astEdges[base + 2]] : absentBranch;
                let types = [ifType, thenType, elseType];
                astCompiled[nodeId] = malloc(K_CONDITIONAL, 0, types, types.length, 0, null);
                break;
            }

            case N_TUPLE: {
                let offset = astChild0[nodeId];
                let count = astChild1[nodeId];
                /** Rest type is appended as the last SLAB element; K_HAS_REST flags it on header */
                let hasRestElem = (astFlags[nodeId] & AST_FLAG_HAS_REST) !== 0;
                let hasContainsElem = (astFlags[nodeId] & AST_FLAG_HAS_CONTAINS) !== 0;
                let totalCount = hasRestElem ? count + 1 : count;
                let types = new Array(totalCount);
                for (let i = 0; i < count; i++) {
                    types[i] = astCompiled[astEdges[offset + i]];
                }
                let extraOffset = offset + count;
                if (hasRestElem) {
                    types[count] = astCompiled[astEdges[extraOffset++]];
                }
                let vp = compileValidator(nodeId);
                // NEW: Inject V_CONTAINS payload if present
                if (hasContainsElem) {
                    let containsType = astCompiled[astEdges[extraOffset++]] >>> 0;
                    if (vp === null) {
                        vp = { vHeader: V_CONTAINS, nodePayloads: [containsType] };
                    } else {
                        // Insert at the correct bit-order position
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
                let kindHeader = (vp !== null) ? (K_TUPLE | K_VALIDATOR) : K_TUPLE;
                if (hasRestElem) {
                    kindHeader |= K_HAS_REST;
                }
                astCompiled[nodeId] = malloc(kindHeader, 0,
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
                let result = malloc(K_REFINE, 0, slabData, 2, 0, null);
                if (innerType & NULLABLE) result |= NULLABLE;
                if (innerType & OPTIONAL) result |= OPTIONAL;
                astCompiled[nodeId] = result >>> 0;
                break;
            }

            case N_DYN_ANCHOR: {
                let innerType = astCompiled[astChild0[nodeId]] >>> 0;
                let edgeBase = astFlags[nodeId];
                let pairCount = astChild1[nodeId];

                /** Build sorted [keyId, compiledTargetType] pairs */
                let pairs = new Array(pairCount * 2);
                for (let i = 0; i < pairCount; i++) {
                    let nameIdx = astEdges[edgeBase + i * 2];
                    let targetNodeId = astEdges[edgeBase + i * 2 + 1];
                    pairs[i * 2] = lookup(propNames[nameIdx]);
                    pairs[i * 2 + 1] = astCompiled[targetNodeId] >>> 0;
                }
                sortByKeyId(pairs);

                /** SLAB: [innerType, keyId0, type0, keyId1, type1, ...] */
                let slabData = new Uint32Array(1 + pairCount * 2);
                slabData[0] = innerType;
                for (let i = 0; i < pairCount * 2; i++) {
                    slabData[1 + i] = pairs[i];
                }
                astCompiled[nodeId] = malloc(K_DYN_ANCHOR, 0, slabData, pairCount, 0, null);
                break;
            }

            case N_UNEVALUATED: {
                let innerType = astCompiled[astChild0[nodeId]] >>> 0;
                let unevalType = astCompiled[astChild1[nodeId]] >>> 0;
                let unevalMode = astFlags[nodeId]; // 0=properties, 1=items
                /** SLAB: [innerType, unevalSchemaType, mode] */
                let slabData = new Uint32Array(3);
                slabData[0] = innerType;
                slabData[1] = unevalType;
                slabData[2] = unevalMode;
                astCompiled[nodeId] = malloc(K_UNEVALUATED, 0, slabData, 3, 0, null);
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
            /**
             * Primitive typedef → promote to K_PRIMITIVE in KINDS.
             * Strip ANY (bit 3) from the header to avoid K_TUPLE (=8) collision with
             * KIND_ENUM_MASK. Store only VALUE bits (4-7) in the header and use
             * K_ANY_INNER to signal that the original type included ANY.
             */
            let primBits = compiled & VALUE;
            let kindHeader = K_PRIMITIVE | primBits;
            if (compiled & ANY) { kindHeader = (kindHeader | K_ANY_INNER) >>> 0; }
            HEAP.KINDS[kindPtr] = kindHeader;
            HEAP.KINDS[kindPtr + 1] = 0;
        } else {
            // Complex type → copy the kind entry
            let realPtr = compiled >>> 3;
            HEAP.KINDS[kindPtr] = HEAP.KINDS[realPtr];
            HEAP.KINDS[kindPtr + 1] = HEAP.KINDS[realPtr + 1];
        }
    }

    // ── Patch circular $dynamicRef fallback types ──
    // Each entry is [targetNodeId, dynRefTypedef]. We patch the fallback
    // type (SLAB[offset+1]) with the now-compiled target.
    for (let i = 0; i < dynRefPatches.length; i++) {
        let [targetId, dynRefType] = dynRefPatches[i];
        let compiled = astCompiled[targetId] >>> 0;
        let ptr = dynRefType >>> 3;
        let ri = HEAP.KINDS[ptr + 1];
        let offset = HEAP.SHAPES[ri * 2];
        HEAP.SLAB[offset + 1] = compiled;
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
