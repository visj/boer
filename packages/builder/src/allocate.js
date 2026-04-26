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
    V_PRIMITIVE_ITEMS, V_UNIQUE_ITEMS, V_MIN_PROPERTIES, V_MAX_PROPERTIES, V_PATTERN_PROPERTIES, V_PROPERTY_NAMES,
    V_ADDITIONAL_PROPERTIES, V_DEPENDENT_REQUIRED,
    V_ENUM,
    K_HAS_ITEMS, K_ALL_REQUIRED,
    KIND_ENUM_MASK,
    MODIFIER, MOD_ARRAY, MOD_RECORD, MOD_ENUM,
    KINDS_SHIFT,
    MOD_ENUM_IS_SET, MOD_ENUM_IDX_SHIFT, MOD_ENUM_IDX_MASK,
    STR_REGEX_IDX_SHIFT, STR_REGEX_IDX_LIMIT,
    STR_MAX_LEN_SHIFT, STR_MAX_LEN_LIMIT,
    STR_MIN_LEN_SHIFT, STR_MIN_LEN_LIMIT,
    NUM_HAS_MIN_BIT, NUM_EXCL_MIN_BIT, NUM_EXCL_MAX_BIT,
    NUM_MIN_NEG_BIT, NUM_MAX_NEG_BIT,
    NUM_MIN_MAG_SHIFT, NUM_MIN_MAG_LIMIT,
    NUM_MAX_MAG_SHIFT, NUM_MAX_MAG_LIMIT,
    MOD_ARRAY_MAX_ITEMS_SHIFT, MOD_ARRAY_MAX_ITEMS_LIMIT,
    MOD_ARRAY_MIN_ITEMS_SHIFT, MOD_ARRAY_MIN_ITEMS_LIMIT,
    assertIsNumber, assertIsObject,
    ERR_ARRAY_ELEMENT_MUST_BE_NUMBER,
    nullable, optional, isNumber, isObject,
    sortByKeyId,
    packValidators, PAYLOAD_QUEUE,
} from '@uvd/core';

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

// --- Heap allocation functions ---

/**
 * Allocates a KINDS entry on the permanent heap. Writes length-prefixed
 * slabData to SLAB, optionally writes validator payloads, then writes a
 * stride-2 KINDS entry. Returns a permanent COMPLEX typedef pointer.
 *
 * KINDS layout (stride-2, logical ptr = kindsIdx / 2):
 *   [kindsIdx]   = header (kind enum | meta bits | K_VALIDATOR)
 *   [kindsIdx+1] = slab_offset (or inline value for K_ARRAY/K_NOT/K_RECORD)
 * K_PRIMITIVE with K_VALIDATOR (compact, 2 slots):
 *   [kindsIdx]   = header | (vHeader << 8)  — vHeader packed in bits 8-24
 *   [kindsIdx+1] = val_ptr (offset into VALIDATORS, first payload)
 * Other kinds with K_VALIDATOR (4 slots):
 *   [kindsIdx+2] = vHeader (Uint32 bitmask)
 *   [kindsIdx+3] = val_ptr (offset into VALIDATORS, first payload)
 *
 * SLAB layout: [length, data0, data1, ...] where length is the semantic count.
 *
 * @param {*} ctx - the __heap object from catalog
 * @param {number} header
 * @param {number} inline - stored as KINDS[kindsIdx+1] when slabData is null
 * @param {Array<number>|Uint32Array|null} slabData
 * @param {number} shapeLen - semantic length stored as SLAB length prefix
 * @param {number} vHeader
 * @param {Array<number>|null} vPayloads
 * @returns {number}
 */
function malloc(ctx, header, inline, slabData, shapeLen, vHeader, vPayloads) {
    let HEAP = ctx.HEAP;
    let slabOffset = inline;
    if (slabData !== null) {
        let count = slabData.length;
        if (HEAP.PTR + count + 1 > HEAP.SLAB_LEN) {
            let buffer = new Uint32Array(HEAP.SLAB_LEN *= 2);
            buffer.set(HEAP.SLAB);
            HEAP.SLAB = buffer;
            ctx.resizeSlab(buffer);
        }
        let offset = HEAP.PTR;
        /** Length prefix: semantic count stored as first SLAB word */
        HEAP.SLAB[offset] = shapeLen;
        HEAP.SLAB.set(slabData, offset + 1);
        HEAP.PTR += count + 1;
        slabOffset = offset;
    }
    let valPtr = 0;
    let slots = 2;
    if (vHeader !== 0 && vPayloads !== null) {
        let vCount = vPayloads.length;
        if (HEAP.VAL_PTR + vCount > HEAP.VAL_LEN) {
            let buffer = new Float64Array(HEAP.VAL_LEN *= 2);
            buffer.set(HEAP.VALIDATORS);
            HEAP.VALIDATORS = buffer;
            ctx.resizeValidators(buffer);
        }
        valPtr = HEAP.VAL_PTR;
        /** Payloads only — vHeader is stored in KINDS, not VALIDATORS */
        HEAP.VALIDATORS.set(vPayloads, valPtr);
        HEAP.VAL_PTR += vCount;
        /**
         * K_PRIMITIVE compact path: pack vHeader into bits 8-24 of the header
         * word and store val_ptr in slot 1. K_PRIMITIVE never has SLAB data,
         * so slot 1 is otherwise wasted. This saves 2 KINDS slots per entry.
         */
        if ((header & KIND_ENUM_MASK) === K_PRIMITIVE) {
            let kindsIdx = HEAP.KIND_PTR;
            if (kindsIdx + 2 > HEAP.KIND_LEN) {
                let buffer = new Uint32Array(HEAP.KIND_LEN *= 2);
                buffer.set(HEAP.KINDS);
                HEAP.KINDS = buffer;
                ctx.resizeKinds(buffer);
            }
            HEAP.KINDS[kindsIdx] = (header | ((vHeader & 0x1FFFF) << 8)) >>> 0;
            HEAP.KINDS[kindsIdx + 1] = valPtr;
            HEAP.KIND_PTR += 2;
            let ptr = kindsIdx >>> 1;
            return (COMPLEX | (ptr << KINDS_SHIFT)) >>> 0;
        }
        slots = 4;
    }
    let kindsIdx = HEAP.KIND_PTR;
    if (kindsIdx + slots > HEAP.KIND_LEN) {
        let buffer = new Uint32Array(HEAP.KIND_LEN *= 2);
        buffer.set(HEAP.KINDS);
        HEAP.KINDS = buffer;
        ctx.resizeKinds(buffer);
    }
    HEAP.KINDS[kindsIdx] = header;
    HEAP.KINDS[kindsIdx + 1] = slabOffset;
    if (slots === 4) {
        HEAP.KINDS[kindsIdx + 2] = vHeader;
        HEAP.KINDS[kindsIdx + 3] = valPtr;
    }
    HEAP.KIND_PTR += slots;
    /** Logical ptr = kindsIdx / 2, encoded in bits 3+: (COMPLEX | (ptr << KINDS_SHIFT)) */
    let ptr = kindsIdx >>> 1;
    return (COMPLEX | (ptr << KINDS_SHIFT)) >>> 0;
}

/**
 * Stores a constant value in the CONSTANTS arena. Returns its index.
 * Used for MOD_ENUM with isSet=0 (single-value const match).
 * @param {*} ctx
 * @param {*} value
 * @returns {number}
 */
function allocConstant(ctx, value) {
    return ctx.CONSTANTS.push(value) - 1;
}

/**
 * Stores a Set in the ENUMS arena. Returns its index.
 * Used for MOD_ENUM with isSet=1 (multi-value enum Set.has() match).
 * @param {*} ctx
 * @param {!Set<*>} set
 * @returns {number}
 */
function allocEnumSet(ctx, set) {
    return ctx.ENUMS.push(set) - 1;
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
            result[i] = cache.push(/** @type {RegExp} */(PAYLOAD_QUEUE.REGEX[ri++])) - 1;
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
 * @param {!Record<string, number | string>} opts
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
    /** Range checks against inline bit field limits */
    if (minVal > STR_MIN_LEN_LIMIT || maxVal > STR_MAX_LEN_LIMIT) {
        return 0;
    }

    let regexIdx = 0;
    if (pattern !== void 0) {
        let cacheLen = ctx.REGEX_CACHE.length;
        if (cacheLen > STR_REGEX_IDX_LIMIT) {
            return 0;
        }
        let re = typeof pattern === 'string' ? new RegExp(pattern, 'u') : pattern;
        regexIdx = ctx.REGEX_CACHE.push(re) - 1;
    }

    /** No payload bits set → not worth inlining (bare STRING is already bits 0-7) */
    if (regexIdx === 0 && minVal === 0 && maxVal === 0) {
        return 0;
    }

    return (STRING | (regexIdx << STR_REGEX_IDX_SHIFT) | (maxVal << STR_MAX_LEN_SHIFT) | (minVal << STR_MIN_LEN_SHIFT)) >>> 0;
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
 *   Bits 14-21 (8b): minMagnitude (0 = no min, 1-255)
 *   Bits 22-31 (10b): maxMagnitude (0 = no max, 1-1023)
 *
 * @param {*} ctx
 * @param {number} primConst - NUMBER or INTEGER
 * @param {!Record<string, number | string>} opts
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
    /** @type {number | void} */
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
    /** @type {number | void} */
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

    let hasMin = 0;
    let minNeg = 0;
    let minMag = 0;
    if (effMin !== void 0) {
        /** Must be integer with magnitude within inline limit */
        if (!Number.isInteger(effMin)) {
            return 0;
        }
        let absMin = Math.abs(effMin);
        if (absMin > NUM_MIN_MAG_LIMIT) {
            return 0;
        }
        hasMin = 1;
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
        if (absMax === 0 || absMax > NUM_MAX_MAG_LIMIT) {
            return 0;
        }
        maxNeg = effMax < 0 ? 1 : 0;
        maxMag = absMax;
    }

    return (primConst
        | (hasMin ? NUM_HAS_MIN_BIT : 0)
        | (exclMin ? NUM_EXCL_MIN_BIT : 0) | (exclMax ? NUM_EXCL_MAX_BIT : 0)
        | (minNeg ? NUM_MIN_NEG_BIT : 0) | (maxNeg ? NUM_MAX_NEG_BIT : 0)
        | (minMag << NUM_MIN_MAG_SHIFT) | (maxMag << NUM_MAX_MAG_SHIFT)) >>> 0;
}

/**
 * @param {*} ctx
 * @param {number} primConst
 * @param {!Record<string, string | number>=} opts
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
    return malloc(ctx, K_PRIMITIVE | K_VALIDATOR | primConst, 0, null, 0, vHeader, payloads);
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
    /** Store [innerType, callbackIdx] on SLAB; KINDS slot 1 = slab offset. */
    let slabData = new Uint32Array(2);
    slabData[0] = typedef >>> 0;
    slabData[1] = callbackIdx;
    let result = malloc(ctx, K_REFINE, 0, slabData, 2, 0, null);
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
    return malloc(ctx, K_TUPLE | K_STRICT, 0, types, types.length, 0, null);
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
        let idx = allocConstant(ctx, value);
        if (idx <= MOD_ENUM_IDX_MASK) {
            return BOOLEAN | MODIFIER | MOD_ENUM | (idx << MOD_ENUM_IDX_SHIFT);
        }
        return refineImpl(ctx, BOOLEAN, value === true ? v => v === true : v => v === false);
    }
    if (typeof value === 'string') {
        let idx = allocConstant(ctx, value);
        if (idx <= MOD_ENUM_IDX_MASK) {
            return STRING | MODIFIER | MOD_ENUM | (idx << MOD_ENUM_IDX_SHIFT);
        }
        /** Fallback: V_ENUM on SLAB */
        let keyId = ctx.lookup(value);
        return malloc(ctx, K_PRIMITIVE | K_VALIDATOR | STRING, 0, null, 0, V_ENUM, [1, keyId]);
    }
    if (typeof value === 'number') {
        let primBits = Number.isInteger(value) ? INTEGER : NUMBER;
        let idx = allocConstant(ctx, value);
        if (idx <= MOD_ENUM_IDX_MASK) {
            return primBits | MODIFIER | MOD_ENUM | (idx << MOD_ENUM_IDX_SHIFT);
        }
        /** Fallback: V_ENUM on SLAB */
        return malloc(ctx, K_PRIMITIVE | K_VALIDATOR | NUMBER, 0, null, 0, V_ENUM, [1, value]);
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
        /** @type {Record<string, number>} */
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
            let idx = allocEnumSet(ctx, set);
            if (idx <= MOD_ENUM_IDX_MASK) {
                let innerBits = strings.length > 0 ? STRING : NUMBER;
                primType = innerBits | MODIFIER | MOD_ENUM | MOD_ENUM_IS_SET | (idx << MOD_ENUM_IDX_SHIFT);
                if (payloadBits & NULLABLE) { primType = primType | NULLABLE; }
                if (payloadBits & OPTIONAL) { primType = primType | OPTIONAL; }
                if (complexTypes.length === 0) { return primType; }
            }
        }
        if (primType === 0) {
            // Fallback: Build K_PRIMITIVE with V_ENUM validator; re-attach NULLABLE / OPTIONAL.
            let primBits = payloadBits & ~(NULLABLE | OPTIONAL);
            primType = malloc(ctx, K_PRIMITIVE | K_VALIDATOR | primBits, 0, null, 0, V_ENUM, payload);
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
    return malloc(ctx, K_RECORD, valueType >>> 0, null, 0, 0, null);
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
    let result = malloc(ctx, K_OR, 0, types, types.length, 0, null);
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
    return malloc(ctx, K_EXCLUSIVE, 0, types, types.length, 0, null);
}

/**
 * @param {*} ctx
 * @param {!Array<number>} types
 * @returns {number}
 */
function intersectImpl(ctx, types) {
    return malloc(ctx, K_INTERSECT, 0, types, types.length, 0, null);
}

/**
 * @param {*} ctx
 * @param {number} typedef
 * @returns {number}
 */
function notImpl(ctx, typedef) {
    assertIsNumber(typedef, 0);
    return malloc(ctx, K_NOT, typedef >>> 0, null, 0, 0, null);
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
    return malloc(ctx, K_CONDITIONAL, 0, types, types.length, 0, null);
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
    /** Check if all properties are required (no OPTIONAL bits) for K_ALL_REQUIRED fast path */
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
    return malloc(ctx, kindHeader, 0, resolved, count, vHeader, payloads);
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
 *   Bits 12-23 (12b): maxItems (0 = no max, 1-4095)
 *   Bits 24-31 (8b):  minItems (0 = no min, 1-255)
 *
 * @param {number} elemType
 * @param {!uvd.ArrayValidators=} opts
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
            if (minItems === 0 || minItems > MOD_ARRAY_MIN_ITEMS_LIMIT) {
                return 0;
            }
        }
        if (opts.maxItems !== void 0) {
            maxItems = +opts.maxItems;
            if (maxItems === 0 || maxItems > MOD_ARRAY_MAX_ITEMS_LIMIT) {
                return 0;
            }
        }
        if (opts.uniqueItems === true) {
            unique = 1;
        }
    }

    return (typeBits | MODIFIER | MOD_ARRAY
        | (unique << 11) | (maxItems << MOD_ARRAY_MAX_ITEMS_SHIFT) | (minItems << MOD_ARRAY_MIN_ITEMS_SHIFT)) >>> 0;
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
    /**
     * V_PRIMITIVE_ITEMS: set when uniqueItems is active and the element type
     * only produces primitive JS values (string, number, boolean, null).
     * Lets the validator use a Set-based O(n) path instead of O(n^2) deepEqual.
     */
    if (vHeader & V_UNIQUE_ITEMS) {
        let et = elemType >>> 0;
        if (!(et & COMPLEX)) {
            if (!(et & ANY) && (et & (STRING | NUMBER | INTEGER | BOOLEAN)) !== 0) {
                vHeader |= V_PRIMITIVE_ITEMS;
            }
        } else {
            let kindsIdx = (et >>> 3) << 1;
            if ((ctx.HEAP.KINDS[kindsIdx] & KIND_ENUM_MASK) === K_PRIMITIVE) {
                vHeader |= V_PRIMITIVE_ITEMS;
            }
        }
    }
    /** K_ARRAY stores elemType as inline (KINDS slot 1); no SLAB entry. */
    let kindHeader = (hasVal ? (K_ARRAY | K_VALIDATOR) : K_ARRAY) | K_HAS_ITEMS;
    return malloc(ctx, kindHeader, elemType >>> 0, null, 0, vHeader, payloads);
}

/**
 * @param {*} ctx
 * @param {string} discriminator
 * @param {!Record<string, number>} variants
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
        let type = /** @type {number} */(variants[keys[i]]);
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
    return malloc(ctx, K_UNION, 0, slabData, count, 0, null);
}

// --- Allocator factories ---

/**
 * @param {uvd.Catalog<any>} cat
 * @returns {(def: *, opts?: *) => number}
 */
function objectAllocator(cat) {
    let ctx = cat.__heap;
    return (def, opts) => objectImpl(ctx, def, opts);
}

/**
 * @param {uvd.Catalog<any>} cat
 * @returns {(type: number, opts?: *) => number}
 */
function arrayAllocator(cat) {
    let ctx = cat.__heap;
    return (type, opts) => arrayImpl(ctx, type, opts);
}

/**
 * @param {uvd.Catalog<any>} cat
 * @returns {(disc: string, variants: *) => number}
 */
function unionAllocator(cat) {
    let ctx = cat.__heap;
    return (disc, variants) => unionImpl(ctx, disc, variants);
}

/**
 * @param {uvd.Catalog<any>} cat
 * @param {number} primConst
 * @returns {(opts?: *) => number}
 */
function valueAllocator(cat, primConst) {
    let ctx = cat.__heap;
    return (opts) => valueImpl(ctx, primConst, opts);
}

/**
 * @param {uvd.Catalog<any>} cat
 * @returns {(typedef: number, fn: function(*): boolean) => number}
 */
function refineAllocator(cat) {
    let ctx = cat.__heap;
    return (typedef, fn) => refineImpl(ctx, typedef, fn);
}

/**
 * @param {uvd.Catalog<any>} cat
 * @returns {(first: *, second?: *, third?: *) => number}
 */
function tupleAllocator(cat) {
    let ctx = cat.__heap;
    return (first, second, third) => tupleArrayImpl(ctx, normalizeTypeArgs(first, second, third));
}

/**
 * @param {uvd.Catalog<any>} cat
 * @returns {(valueType: number) => number}
 */
function recordAllocator(cat) {
    let ctx = cat.__heap;
    return (valueType) => recordImpl(ctx, valueType);
}

/**
 * @param {uvd.Catalog<any>} cat
 * @returns {(first: *, second?: *, third?: *) => number}
 */
function orAllocator(cat) {
    let ctx = cat.__heap;
    return (first, second, third) => orImpl(ctx, normalizeTypeArgs(first, second, third));
}

/**
 * @param {uvd.Catalog<any>} cat
 * @returns {(first: *, second?: *, third?: *) => number}
 */
function exclusiveAllocator(cat) {
    let ctx = cat.__heap;
    return (first, second, third) => exclusiveImpl(ctx, normalizeTypeArgs(first, second, third));
}

/**
 * @param {uvd.Catalog<any>} cat
 * @returns {(first: *, second?: *, third?: *) => number}
 */
function intersectAllocator(cat) {
    let ctx = cat.__heap;
    return (first, second, third) => intersectImpl(ctx, normalizeTypeArgs(first, second, third));
}

/**
 * @param {uvd.Catalog<any>} cat
 * @returns {(typedef: number) => number}
 */
function notAllocator(cat) {
    let ctx = cat.__heap;
    return (typedef) => notImpl(ctx, typedef);
}

/**
 * @param {uvd.Catalog<any>} cat
 * @returns {(config: *) => number}
 */
function whenAllocator(cat) {
    let ctx = cat.__heap;
    return (config) => whenImpl(ctx, config);
}

// --- Convenience bundle ---

/**
 * @param {uvd.Catalog<any>} cat
 * @returns {uvd.Allocators<any>}
 */
function allocators(cat) {
    let ctx = cat.__heap;
    return /** @type {*} */({
        object: (/** @type {*} */ def, /** @type {*} */ opts) => objectImpl(ctx, def, opts),
        array: (/** @type {*} */ type, /** @type {*} */ opts) => arrayImpl(ctx, type, opts),
        union: (/** @type {*} */ disc, /** @type {*} */ variants) => unionImpl(ctx, disc, variants),
        string: (/** @type {*} */ opts) => valueImpl(ctx, STRING, opts),
        number: (/** @type {*} */ opts) => valueImpl(ctx, NUMBER, opts),
        boolean: (/** @type {*} */ opts) => valueImpl(ctx, BOOLEAN, opts),
        refine: (/** @type {*} */ typedef, /** @type {*} */ fn) => refineImpl(ctx, typedef, fn),
        tuple: (/** @type {*} */ first, /** @type {*} */ second, /** @type {*} */ third) => tupleArrayImpl(ctx, normalizeTypeArgs(first, second, third)),
        record: (/** @type {*} */ valueType) => recordImpl(ctx, valueType),
        or: (/** @type {*} */ first, /** @type {*} */ second, /** @type {*} */ third) => orImpl(ctx, normalizeTypeArgs(first, second, third)),
        exclusive: (/** @type {*} */ first, /** @type {*} */ second, /** @type {*} */ third) => exclusiveImpl(ctx, normalizeTypeArgs(first, second, third)),
        intersect: (/** @type {*} */ first, /** @type {*} */ second, /** @type {*} */ third) => intersectImpl(ctx, normalizeTypeArgs(first, second, third)),
        not: (/** @type {*} */ typedef) => notImpl(ctx, typedef),
        when: (/** @type {*} */ config) => whenImpl(ctx, config),
        literal: (/** @type {*} */ value) => literalImpl(ctx, value),
        enum: (/** @type {*} */ values) => enumImpl(ctx, values),
        optional,
        nullable,
    });
}

export {
    malloc,
    allocConstant,
    allocEnumSet,
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
