/// <reference path="../../global.d.ts" />
import {
    COMPLEX, NULLABLE, OPTIONAL,
    ANY,
    STRING, NUMBER, BOOLEAN, INTEGER,
    PRIM_MASK,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_RECORD,
    K_OR, K_EXCLUSIVE, K_INTERSECT,
    K_UNION, K_TUPLE, K_REFINE, K_NOT,
    K_CONDITIONAL, K_ANY_INNER,
    K_VALIDATOR, K_STRICT,
    V_MIN_LENGTH, V_MAX_LENGTH, V_PATTERN, V_FORMAT,
    V_MINIMUM, V_MAXIMUM, V_MULTIPLE_OF, V_EXCLUSIVE_MINIMUM, V_EXCLUSIVE_MAXIMUM,
    V_MIN_ITEMS, V_MAX_ITEMS, V_CONTAINS, V_MIN_CONTAINS, V_MAX_CONTAINS,
    V_UNIQUE_ITEMS, V_MIN_PROPERTIES, V_MAX_PROPERTIES, V_PATTERN_PROPERTIES, V_PROPERTY_NAMES,
    V_ADDITIONAL_PROPERTIES, V_DEPENDENT_REQUIRED,
    V_ENUM,
    K_HAS_ITEMS,
    MODIFIER, MOD_ARRAY, MOD_RECORD, MOD_ENUM,
} from './const.js';
import {
    assertIsNumber, assertIsObject,
    ERR_ARRAY_ELEMENT_MUST_BE_NUMBER,
} from './error.js';
import {
    nullable, optional, isNumber, isObject,
    sortByKeyId,
} from './util.js';
import { packValidators, PAYLOAD_QUEUE } from './validator.js';

// --- Helper functions ---

/**
 * Helper to normalize variadic (a, b, c) or array-first ([a, b, c]) args
 * into a flat array of types.
 * @param {*} first
 * @param {*} second
 * @param {*} third
 * @returns {!Array<number>}
 */
function normalizeTypeArgs(first, second, third) {
    if (Array.isArray(first)) {
        return first;
    }
    if (third !== void 0) {
        return [first, second, third];
    }
    if (second !== void 0) {
        return [first, second];
    }
    return [first];
}

const STR_MASK = V_MIN_LENGTH | V_MAX_LENGTH | V_PATTERN | V_FORMAT;
const NUM_MASK = V_MINIMUM | V_MAXIMUM | V_MULTIPLE_OF | V_EXCLUSIVE_MINIMUM | V_EXCLUSIVE_MAXIMUM;
const ARR_MASK = V_MIN_ITEMS | V_MAX_ITEMS | V_CONTAINS | V_MIN_CONTAINS | V_MAX_CONTAINS | V_UNIQUE_ITEMS;
const OBJ_MASK = V_MIN_PROPERTIES | V_MAX_PROPERTIES | V_PATTERN_PROPERTIES
    | V_PROPERTY_NAMES | V_DEPENDENT_REQUIRED | V_ADDITIONAL_PROPERTIES;

/**
 * Migrates RegExp objects from PAYLOAD_QUEUE.REGEX into a cache array and
 * replaces the -1 placeholders in `result` with the resulting cache indices.
 * Consumes PAYLOAD_QUEUE.REGEX entries in order.
 * @param {!Array<number>} result — [vHeader, ...payloads] from packValidators
 * @param {!Array<RegExp>} cache — the regex cache to push into (REGEX_CACHE)
 */
function migrateRegex(result, cache) {
    let ri = 0;
    for (let i = 1; i < result.length; i++) {
        if (result[i] === -1) {
            result[i] = cache.push(PAYLOAD_QUEUE.REGEX[ri++]) - 1;
        }
    }
}

// --- Impl functions ---

/**
 * Attempts to inline a STRING typedef with validator constraints into a 30-bit
 * integer. Returns 0 if inlining is not possible (fallback to SLAB).
 *
 * Inline layout (MODIFIER=0, STRING bit set):
 *   Bits 9-16  (8 bits): regexIdx (0 = no pattern, 1-255)
 *   Bits 17-24 (8 bits): maxLength (0 = no max, 1-255)
 *   Bits 25-29 (5 bits): minLength (0 = no min, 1-31)
 *
 * @param {*} ctx
 * @param {!Object} opts
 * @returns {number} inline typedef or 0
 */
function tryInlineString(ctx, opts) {
    /** format cannot be inlined */
    if (opts.format !== void 0) {
        return 0;
    }
    let minLen = opts.minLength;
    let maxLen = opts.maxLength;
    let pattern = opts.pattern;

    let minVal = minLen !== void 0 ? +minLen : 0;
    let maxVal = maxLen !== void 0 ? +maxLen : 0;

    /** 0 value means "no constraint" in inline encoding, so actual 0 can't be inlined */
    if (minLen !== void 0 && minVal === 0) {
        return 0;
    }
    if (maxLen !== void 0 && maxVal === 0) {
        return 0;
    }
    /** Range checks: 5 bits for min (1-31), 8 bits for max (1-255) */
    if (minVal > 31 || maxVal > 255) {
        return 0;
    }

    let regexIdx = 0;
    if (pattern !== void 0) {
        let cacheLen = ctx.REGEX_CACHE.length;
        if (cacheLen > 255) {
            return 0;
        }
        let re = typeof pattern === 'string' ? new RegExp(pattern, 'u') : pattern;
        regexIdx = ctx.REGEX_CACHE.push(re) - 1;
    }

    /** No payload bits set → not worth inlining (bare STRING is already bits 0-7) */
    if (regexIdx === 0 && minVal === 0 && maxVal === 0) {
        return 0;
    }

    return STRING | (regexIdx << 9) | (maxVal << 17) | (minVal << 25);
}

/**
 * Attempts to inline a NUMBER or INTEGER typedef with validator constraints
 * into a 30-bit integer. Returns 0 if inlining is not possible.
 *
 * Only integer bounds can be inlined. Float bounds or multipleOf require SLAB.
 *
 * Inline layout (MODIFIER=0, NUMBER or INTEGER bit set):
 *   Bit 9:           EXCLUSIVE_MIN
 *   Bit 10:          EXCLUSIVE_MAX
 *   Bit 11:          MIN_NEGATIVE
 *   Bit 12:          MAX_NEGATIVE
 *   Bits 13-21 (9b): minMagnitude (0 = no min, 1-511)
 *   Bits 22-29 (8b): maxMagnitude (0 = no max, 1-255)
 *
 * @param {*} ctx
 * @param {number} primConst - NUMBER or INTEGER
 * @param {!Object} opts
 * @returns {number} inline typedef or 0
 */
function tryInlineNumber(ctx, primConst, opts) {
    /** multipleOf cannot be inlined */
    if (opts.multipleOf !== void 0) {
        return 0;
    }

    /**
     * Resolve effective min/max bounds. JSON Schema allows both `minimum` and
     * `exclusiveMinimum` to coexist; the stricter one wins.
     */
    let effMin = void 0;
    let exclMin = 0;
    let rawMin = opts.minimum;
    let rawExMin = opts.exclusiveMinimum;
    if (rawMin !== void 0 && rawExMin !== void 0) {
        if (+rawExMin >= +rawMin) {
            effMin = +rawExMin;
            exclMin = 1;
        } else {
            effMin = +rawMin;
        }
    } else if (rawMin !== void 0) {
        effMin = +rawMin;
    } else if (rawExMin !== void 0) {
        effMin = +rawExMin;
        exclMin = 1;
    }

    let effMax = void 0;
    let exclMax = 0;
    let rawMax = opts.maximum;
    let rawExMax = opts.exclusiveMaximum;
    if (rawMax !== void 0 && rawExMax !== void 0) {
        if (+rawExMax <= +rawMax) {
            effMax = +rawExMax;
            exclMax = 1;
        } else {
            effMax = +rawMax;
        }
    } else if (rawMax !== void 0) {
        effMax = +rawMax;
    } else if (rawExMax !== void 0) {
        effMax = +rawExMax;
        exclMax = 1;
    }

    /** No bounds → not worth inlining */
    if (effMin === void 0 && effMax === void 0) {
        return 0;
    }

    let minNeg = 0;
    let minMag = 0;
    if (effMin !== void 0) {
        /** Must be integer with magnitude 1-511 (0 magnitude = "no bound" sentinel) */
        if (!Number.isInteger(effMin)) {
            return 0;
        }
        let absMin = Math.abs(effMin);
        if (absMin === 0 || absMin > 511) {
            return 0;
        }
        minNeg = effMin < 0 ? 1 : 0;
        minMag = absMin;
    }

    let maxNeg = 0;
    let maxMag = 0;
    if (effMax !== void 0) {
        if (!Number.isInteger(effMax)) {
            return 0;
        }
        let absMax = Math.abs(effMax);
        if (absMax === 0 || absMax > 255) {
            return 0;
        }
        maxNeg = effMax < 0 ? 1 : 0;
        maxMag = absMax;
    }

    return primConst
        | (exclMin << 9) | (exclMax << 10)
        | (minNeg << 11) | (maxNeg << 12)
        | (minMag << 13) | (maxMag << 22);
}

/**
 * @param {*} ctx
 * @param {number} primConst
 * @param {!Object=} opts
 * @returns {number}
 */
function valueImpl(ctx, primConst, opts) {
    if (opts === void 0) {
        return primConst;
    }
    /** Try inline encoding before falling back to K_PRIMITIVE + VALIDATORS */
    if (primConst & STRING) {
        let inlined = tryInlineString(ctx, opts);
        if (inlined !== 0) {
            return inlined;
        }
    } else if (primConst & (NUMBER | INTEGER)) {
        let inlined = tryInlineNumber(ctx, primConst, opts);
        if (inlined !== 0) {
            return inlined;
        }
    }
    let mask = (primConst & STRING) ? STR_MASK : NUM_MASK;
    let result = packValidators(opts, mask, null);
    migrateRegex(result, ctx.REGEX_CACHE);
    let vHeader = result[0];
    let payloads = result.slice(1);
    /** K_PRIMITIVE stores the validator index as inline (KINDS slot 1), no SLAB entry. */
    let valIdx = ctx.allocValidator(vHeader, payloads);
    return ctx.malloc(K_PRIMITIVE | K_VALIDATOR | primConst, valIdx, null, 0, 0, null);
}

/**
 * @param {*} ctx
 * @param {number} typedef
 * @param {function(*): boolean} fn
 * @returns {number}
 */
function refineImpl(ctx, typedef, fn) {
    assertIsNumber(typedef, 0);
    let callbackIdx = ctx.CALLBACKS.push(fn) - 1;
    /** Store [innerType, callbackIdx] on SLAB; KINDS slot 1 = SHAPES index. */
    let slabData = new Uint32Array(2);
    slabData[0] = typedef >>> 0;
    slabData[1] = callbackIdx;
    let result = ctx.malloc(K_REFINE, 0, slabData, 2, 0, null);
    if (typedef & NULLABLE) {
        result |= NULLABLE;
    }
    if (typedef & OPTIONAL) {
        result |= OPTIONAL;
    }
    return result >>> 0;
}

/**
 * @param {*} ctx
 * @param {!Array<number>} types
 * @returns {number}
 */
function tupleArrayImpl(ctx, types) {
    return ctx.malloc(K_TUPLE | K_STRICT, 0, types, types.length, 0, null);
}

/**
 * Encodes a single literal value as a zero-allocation typedef.
 *   null    → NULLABLE pointer
 *   true    → K_REFINE(BOOLEAN, v => v === true)
 *   false   → K_REFINE(BOOLEAN, v => v === false)
 *   string  → K_PRIMITIVE | STRING | K_VALIDATOR with V_ENUM [1, keyId]
 *   number  → K_PRIMITIVE | NUMBER | K_VALIDATOR with V_ENUM [1, num]
 *   array   → K_TUPLE with each element recursively desugared
 *   object  → K_OBJECT with each property recursively desugared + additionalProperties:false
 * @param {*} ctx
 * @param {*} value
 * @returns {number}
 */
function literalImpl(ctx, value) {
    if (value === null) { return NULLABLE; }
    if (value === true || value === false) {
        let idx = ctx.allocConstant(value);
        if (idx <= 0x3FFFF) {
            return BOOLEAN | MODIFIER | MOD_ENUM | (idx << 12);
        }
        return refineImpl(ctx, BOOLEAN, value === true ? v => v === true : v => v === false);
    }
    if (typeof value === 'string') {
        let idx = ctx.allocConstant(value);
        if (idx <= 0x3FFFF) {
            return STRING | MODIFIER | MOD_ENUM | (idx << 12);
        }
        /** Fallback: V_ENUM on SLAB */
        let keyId = ctx.lookup(value);
        let valIdx = ctx.allocValidator(V_ENUM, [1, keyId]);
        return ctx.malloc(K_PRIMITIVE | K_VALIDATOR | STRING, valIdx, null, 0, 0, null);
    }
    if (typeof value === 'number') {
        let primBits = Number.isInteger(value) ? INTEGER : NUMBER;
        let idx = ctx.allocConstant(value);
        if (idx <= 0x3FFFF) {
            return primBits | MODIFIER | MOD_ENUM | (idx << 12);
        }
        /** Fallback: V_ENUM on SLAB */
        let valIdx = ctx.allocValidator(V_ENUM, [1, value]);
        return ctx.malloc(K_PRIMITIVE | K_VALIDATOR | NUMBER, valIdx, null, 0, 0, null);
    }
    if (Array.isArray(value)) {
        /** Desugar to exact-length K_TUPLE: each element becomes its own literal type. */
        let elemTypes = new Array(value.length);
        for (let i = 0; i < value.length; i++) {
            elemTypes[i] = literalImpl(ctx, value[i]);
        }
        return tupleArrayImpl(ctx, elemTypes);
    }
    if (typeof value === 'object') {
        /** Desugar to K_OBJECT with additionalProperties:false: each property is a literal type. */
        let keys = Object.keys(value);
        let def = {};
        for (let i = 0; i < keys.length; i++) {
            def[keys[i]] = literalImpl(ctx, value[keys[i]]);
        }
        return objectImpl(ctx, def, { additionalProperties: false });
    }
    return 0;
}

/**
 * Encodes an array of allowed values as a typedef. Uses the V_ENUM fast-path
 * for primitive values and structural desugaring for objects/arrays.
 *   - null / true / false → primitive bit flags only, no validator payload
 *   - strings  → sorted keyId binary search (V_ENUM)
 *   - numbers  → sorted float64 binary search (V_ENUM)
 *   - objects  → K_OBJECT structural desugaring via literalImpl
 *   - arrays   → K_TUPLE structural desugaring via literalImpl
 * Heterogeneous enums with complex types (Rule C.2) are wrapped in K_OR.
 * @param {*} ctx
 * @param {!Array<*>} values
 * @returns {number}
 */
function enumImpl(ctx, values) {
    if (!Array.isArray(values) || values.length === 0) { return 0; }
    /** @type {string[]} */
    let strings = [];
    /** @type {number[]} */
    let numbers = [];
    let enumPrimBits = 0;
    let hasTrueFlag = false;
    let hasFalseFlag = false;
    /** @type {number[]} */
    let complexTypes = [];
    for (let i = 0; i < values.length; i++) {
        let v = values[i];
        if (v === null) { enumPrimBits |= NULLABLE; }
        else if (v === true) { hasTrueFlag = true; }
        else if (v === false) { hasFalseFlag = true; }
        else if (typeof v === 'string') { strings.push(v); }
        else if (typeof v === 'number') { numbers.push(v); }
        else { complexTypes.push(literalImpl(ctx, v)); }
    }
    /** Merge boolean flags: both present → BOOLEAN bit; only one → K_REFINE for exact match */
    if (hasTrueFlag && hasFalseFlag) {
        enumPrimBits |= BOOLEAN;
    } else if (hasTrueFlag) {
        complexTypes.push(literalImpl(ctx, true));
    } else if (hasFalseFlag) {
        complexTypes.push(literalImpl(ctx, false));
    }
    let primType = 0;
    let payloadBits = enumPrimBits;
    let payload = [];
    if (strings.length > 0) {
        payloadBits |= STRING;
        let keyIds = new Array(strings.length);
        for (let i = 0; i < strings.length; i++) { keyIds[i] = ctx.lookup(strings[i]); }
        keyIds.sort((a, b) => a - b);
        payload.push(keyIds.length);
        for (let i = 0; i < keyIds.length; i++) { payload.push(keyIds[i]); }
    }
    if (numbers.length > 0) {
        payloadBits |= NUMBER;
        let nums = numbers.slice().sort((a, b) => a - b);
        payload.push(nums.length);
        for (let i = 0; i < nums.length; i++) { payload.push(nums[i]); }
    }
    if (payload.length > 0) {
        /**
         * Try inline MOD_ENUM path: single-type enum (only strings OR only numbers,
         * not both), no booleans mixed in. Use a Set for O(1) membership check.
         */
        let canInline = complexTypes.length === 0 &&
            ((strings.length > 0) !== (numbers.length > 0));
        if (canInline) {
            let set = strings.length > 0
                ? new Set(strings)
                : new Set(numbers);
            let idx = ctx.allocEnumSet(set);
            if (idx <= 0x3FFFF) {
                let innerBits = strings.length > 0 ? STRING : NUMBER;
                primType = innerBits | MODIFIER | MOD_ENUM | (1 << 11) | (idx << 12);
                if (payloadBits & NULLABLE) { primType = primType | NULLABLE; }
                if (payloadBits & OPTIONAL) { primType = primType | OPTIONAL; }
                if (complexTypes.length === 0) { return primType; }
            }
        }
        if (primType === 0) {
            // Fallback: Build K_PRIMITIVE with V_ENUM validator; re-attach NULLABLE / OPTIONAL.
            let primBits = payloadBits & ~(NULLABLE | OPTIONAL);
            let valIdx = ctx.allocValidator(V_ENUM, payload);
            primType = ctx.malloc(K_PRIMITIVE | K_VALIDATOR | primBits, valIdx, null, 0, 0, null);
            if (payloadBits & NULLABLE) { primType = (primType | NULLABLE) >>> 0; }
            if (payloadBits & OPTIONAL) { primType = (primType | OPTIONAL) >>> 0; }
        }
    } else if (payloadBits !== 0) {
        // Boolean/null only — no validator payload needed, raw bit flags suffice.
        primType = payloadBits >>> 0;
    }
    if (complexTypes.length === 0) { return primType; }
    // Rule C.2: mix of structural + primitive types → K_OR.
    let branches = complexTypes.slice();
    if (primType !== 0) { branches.unshift(primType); }
    return orImpl(ctx, branches);
}

/**
 * @param {*} ctx
 * @param {number} valueType
 * @returns {number}
 */
function recordImpl(ctx, valueType) {
    assertIsNumber(valueType, 0);
    /**
     * Try inline MOD_RECORD: value type must be a bare primitive (bits 0-7 only).
     * MOD_RECORD layout: innerPrimBits | MODIFIER | MOD_RECORD
     * Without min/maxProperties, all payload bits are 0.
     */
    if (!(valueType & (COMPLEX | NULLABLE | OPTIONAL)) && valueType <= 0xFF) {
        let typeBits = valueType & 0xF8;
        if (typeBits !== 0 && (typeBits & (typeBits - 1)) === 0) {
            return typeBits | MODIFIER | MOD_RECORD;
        }
    }
    return ctx.malloc(K_RECORD, valueType >>> 0, null, 0, 0, null);
}

/**
 * @param {*} ctx
 * @param {!Array<number>} types
 * @returns {number}
 */
function orImpl(ctx, types) {
    // Fast path: if all inputs are bare primitives (bits 0-7 only, no COMPLEX,
    // no inline modifiers), just OR the bits together — no allocation needed.
    // Inline types (> 0xFF) cannot be merged because their payload bits would collide.
    let allBarePrimitive = true;
    let merged = 0;
    let j = 0;
    let nullableOptional = 0;
    let length = types.length;
    for (let i = 0; i < length; i++, j++) {
        const type = /** @type {number} */(types[i]);
        if (type & NULLABLE) {
            nullableOptional |= NULLABLE;
        }
        if (type & OPTIONAL) {
            nullableOptional |= OPTIONAL;
        }
        if ((type & COMPLEX) || type > 0xFF) {
            allBarePrimitive = false;
            break;
        }
        merged |= type;
    }
    if (allBarePrimitive) {
        return merged >>> 0;
    }
    let result = ctx.malloc(K_OR, 0, types, types.length, 0, null);
    for (; j < length; j++) {
        const type = /** @type {number} */(types[j]);
        if (type & NULLABLE) {
            nullableOptional |= NULLABLE;
        }
        if (type & OPTIONAL) {
            nullableOptional |= OPTIONAL;
        }
    }
    return (result | nullableOptional) >>> 0;
}

/**
 * @param {*} ctx
 * @param {!Array<number>} types
 * @returns {number}
 */
function exclusiveImpl(ctx, types) {
    return ctx.malloc(K_EXCLUSIVE, 0, types, types.length, 0, null);
}

/**
 * @param {*} ctx
 * @param {!Array<number>} types
 * @returns {number}
 */
function intersectImpl(ctx, types) {
    return ctx.malloc(K_INTERSECT, 0, types, types.length, 0, null);
}

/**
 * @param {*} ctx
 * @param {number} typedef
 * @returns {number}
 */
function notImpl(ctx, typedef) {
    assertIsNumber(typedef, 0);
    return ctx.malloc(K_NOT, typedef >>> 0, null, 0, 0, null);
}

/**
 * @param {*} ctx
 * @param {!uvd.WhenValidators} config
 * @returns {number}
 */
function whenImpl(ctx, config) {
    // Always store 3 slots: [if, then, else]
    // Use ANY|NULLABLE|OPTIONAL as the "absent branch" sentinel (accepts any value).
    // We cannot use 0 because NEVER = 0 would be indistinguishable from "no constraint".
    let absentBranch = (ANY | NULLABLE | OPTIONAL) >>> 0;
    let types = [
        config.if >>> 0,
        config.then !== void 0 ? config.then >>> 0 : absentBranch,
        config.else !== void 0 ? config.else >>> 0 : absentBranch
    ];
    return ctx.malloc(K_CONDITIONAL, 0, types, types.length, 0, null);
}

/**
 * @template {symbol} R
 * @param {*} ctx
 * @param {uvd.Schema<R>} definition
 * @param {uvd.ObjectValidators=} opts
 * @returns {number}
 */
function objectImpl(ctx, definition, opts) {
    let keys = Object.keys(definition);
    let count = keys.length;
    let required = count * 2;
    /** @type {Array<number>} */
    let resolved = new Array(required);
    for (let i = 0, j = 0; i < count; i++, j += 2) {
        let key = keys[i];
        let type = definition[key];
        if (isNumber(type)) {
            let isComplex = (type & COMPLEX) !== 0;
            if (isComplex) {
                let kIndex = type >>> 3;
                let kindLimit = ctx.HEAP.KIND_PTR;
                if (kIndex >= kindLimit) {
                    throw new Error('Object corruption at key ' + key + '. You cannot use the bitwise OR operator (|) to combine a complex type with a primitive type');
                }
            }
        } else if (isObject(type)) {
            type = objectImpl(ctx, /** @type {uvd.Schema<R>} */(type));
        } else {
            throw new Error('Invalid type for key ' + key);
        }
        resolved[j] = ctx.lookup(key);
        resolved[j + 1] = /** @type {number} */(type) >>> 0;
    }
    sortByKeyId(resolved);
    const hasValidator = opts !== void 0;
    let vHeader = 0;
    let payloads = null;
    if (hasValidator) {
        let result = packValidators(opts, OBJ_MASK, ctx.lookup);
        migrateRegex(result, ctx.REGEX_CACHE);
        vHeader = result[0];
        payloads = result.slice(1);
    }
    let kindHeader = hasValidator ? (K_OBJECT | K_VALIDATOR) : K_OBJECT;
    return ctx.malloc(kindHeader, 0, resolved, count, vHeader, payloads);
}

/**
 * Attempts to inline an array type as MOD_ARRAY. Returns 0 if not possible.
 *
 * Requirements for inlining:
 *   - elemType is a simple primitive (no COMPLEX, no MOD_*, fits in bits 3-7)
 *   - Only minItems, maxItems, uniqueItems are used (no contains)
 *   - Values fit in their bit ranges
 *
 * MOD_ARRAY layout (MODIFIER=1, MOD_ARRAY=0<<9):
 *   Bits 3-7:        inner primitive type
 *   Bit 11:          UNIQUE flag
 *   Bits 12-21 (10b): maxItems (0 = no max, 1-1023)
 *   Bits 22-29 (8b):  minItems (0 = no min, 1-255)
 *
 * @param {number} elemType
 * @param {!Object|undefined} opts
 * @returns {number} inline typedef or 0
 */
function tryInlineArray(elemType, opts) {
    /**
     * elemType must be a pure bare primitive (bits 3-7 only, no COMPLEX,
     * no NULLABLE/OPTIONAL, no MOD_*). NULLABLE/OPTIONAL on the element
     * type would conflict with the outer container's own NULLABLE/OPTIONAL bits.
     */
    if (elemType & (COMPLEX | NULLABLE | OPTIONAL)) {
        return 0;
    }
    if (elemType > 0xFF) {
        return 0;
    }
    /** Must have a single primitive type bit set (no unions like STRING|NUMBER) */
    let typeBits = elemType & 0xF8; // bits 3-7
    if (typeBits === 0 || (typeBits & (typeBits - 1)) !== 0) {
        return 0;
    }

    let minItems = 0;
    let maxItems = 0;
    let unique = 0;

    if (opts !== void 0) {
        /** contains, minContains, maxContains cannot be inlined */
        if (opts.contains !== void 0 || opts.minContains !== void 0 || opts.maxContains !== void 0) {
            return 0;
        }
        if (opts.minItems !== void 0) {
            minItems = +opts.minItems;
            if (minItems === 0 || minItems > 255) {
                return 0;
            }
        }
        if (opts.maxItems !== void 0) {
            maxItems = +opts.maxItems;
            if (maxItems === 0 || maxItems > 1023) {
                return 0;
            }
        }
        if (opts.uniqueItems === true) {
            unique = 1;
        }
    }

    return typeBits | MODIFIER | MOD_ARRAY
        | (unique << 11) | (maxItems << 12) | (minItems << 22);
}

/**
 * @param {*} ctx
 * @param {number} elemType
 * @param {uvd.ArrayValidators=} opts
 * @returns {number}
 */
function arrayImpl(ctx, elemType, opts) {
    assertIsNumber(elemType, ERR_ARRAY_ELEMENT_MUST_BE_NUMBER);
    /** Try inline MOD_ARRAY encoding */
    let inlined = tryInlineArray(elemType, opts);
    if (inlined !== 0) {
        return inlined;
    }
    const hasVal = opts !== void 0;
    let vHeader = 0;
    let payloads = null;
    if (hasVal) {
        let result = packValidators(opts, ARR_MASK, null);
        vHeader = result[0];
        payloads = result.slice(1);
    }
    /** K_ARRAY stores elemType as inline (KINDS slot 1); no SLAB or SHAPES entry. */
    let kindHeader = (hasVal ? (K_ARRAY | K_VALIDATOR) : K_ARRAY) | K_HAS_ITEMS;
    return ctx.malloc(kindHeader, elemType >>> 0, null, 0, vHeader, payloads);
}

/**
 * @param {*} ctx
 * @param {string} discriminator
 * @param {!Object} variants
 * @returns {number}
 */
function unionImpl(ctx, discriminator, variants) {
    if (!isObject(variants) || Array.isArray(variants)) {
        throw new Error('discriminated variants must be an object literal { key: type }');
    }
    if (typeof discriminator !== 'string') {
        throw new Error('discriminated discriminator must be a string');
    }
    let keys = Object.keys(variants);
    let count = keys.length;
    let required = count * 2;

    /** @type {!Array<number>} */
    let resolved = new Array(required);
    for (let i = 0; i < count; i++) {
        let type = variants[keys[i]];
        if (typeof type !== 'number') {
            throw new Error('Invalid variant type for key ' + keys[i]);
        }
        resolved[i * 2] = ctx.lookup(keys[i]);
        resolved[i * 2 + 1] = type >>> 0;
    }

    let discKeyId = ctx.lookup(discriminator);
    /** Prepend discKeyId as the first SLAB entry; variants follow as [keyId, type] pairs. */
    let slabData = new Uint32Array(1 + count * 2);
    slabData[0] = discKeyId;
    for (let i = 0; i < count * 2; i++) {
        slabData[1 + i] = resolved[i];
    }
    return ctx.malloc(K_UNION, 0, slabData, count, 0, null);
}

// --- Allocator factories ---

function objectAllocator(cat) {
    let ctx = cat.__heap;
    return (def, opts) => objectImpl(ctx, def, opts);
}

function arrayAllocator(cat) {
    let ctx = cat.__heap;
    return (type, opts) => arrayImpl(ctx, type, opts);
}

function unionAllocator(cat) {
    let ctx = cat.__heap;
    return (disc, variants) => unionImpl(ctx, disc, variants);
}

function valueAllocator(cat, primConst) {
    let ctx = cat.__heap;
    return (opts) => valueImpl(ctx, primConst, opts);
}

function refineAllocator(cat) {
    let ctx = cat.__heap;
    return (typedef, fn) => refineImpl(ctx, typedef, fn);
}

function tupleAllocator(cat) {
    let ctx = cat.__heap;
    return (first, second, third) => tupleArrayImpl(ctx, normalizeTypeArgs(first, second, third));
}

function recordAllocator(cat) {
    let ctx = cat.__heap;
    return (valueType) => recordImpl(ctx, valueType);
}

function orAllocator(cat) {
    let ctx = cat.__heap;
    return (first, second, third) => orImpl(ctx, normalizeTypeArgs(first, second, third));
}

function exclusiveAllocator(cat) {
    let ctx = cat.__heap;
    return (first, second, third) => exclusiveImpl(ctx, normalizeTypeArgs(first, second, third));
}

function intersectAllocator(cat) {
    let ctx = cat.__heap;
    return (first, second, third) => intersectImpl(ctx, normalizeTypeArgs(first, second, third));
}

function notAllocator(cat) {
    let ctx = cat.__heap;
    return (typedef) => notImpl(ctx, typedef);
}

function whenAllocator(cat) {
    let ctx = cat.__heap;
    return (config) => whenImpl(ctx, config);
}

// --- Convenience bundle ---

function allocators(cat) {
    let ctx = cat.__heap;
    return {
        object: (def, opts) => objectImpl(ctx, def, opts),
        array: (type, opts) => arrayImpl(ctx, type, opts),
        union: (disc, variants) => unionImpl(ctx, disc, variants),
        string: (opts) => valueImpl(ctx, STRING, opts),
        number: (opts) => valueImpl(ctx, NUMBER, opts),
        boolean: (opts) => valueImpl(ctx, BOOLEAN, opts),
        refine: (typedef, fn) => refineImpl(ctx, typedef, fn),
        tuple: (first, second, third) => tupleArrayImpl(ctx, normalizeTypeArgs(first, second, third)),
        record: (valueType) => recordImpl(ctx, valueType),
        or: (first, second, third) => orImpl(ctx, normalizeTypeArgs(first, second, third)),
        exclusive: (first, second, third) => exclusiveImpl(ctx, normalizeTypeArgs(first, second, third)),
        intersect: (first, second, third) => intersectImpl(ctx, normalizeTypeArgs(first, second, third)),
        not: (typedef) => notImpl(ctx, typedef),
        when: (config) => whenImpl(ctx, config),
        literal: (value) => literalImpl(ctx, value),
        enum: (values) => enumImpl(ctx, values),
        optional,
        nullable,
    };
}

export {
    allocators,
    objectAllocator,
    arrayAllocator,
    unionAllocator,
    valueAllocator,
    refineAllocator,
    tupleAllocator,
    recordAllocator,
    orAllocator,
    exclusiveAllocator,
    intersectAllocator,
    notAllocator,
    whenAllocator,
};
