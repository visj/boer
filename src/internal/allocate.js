/// <reference path="../../global.d.ts" />
import {
    COMPLEX, NULLABLE, OPTIONAL, SCRATCH,
    TRUE, FALSE, NEVER,
    STRING, NUMBER, BOOLEAN, BIGINT, DATE, URI, INTEGER,
    PRIM_MASK,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_RECORD,
    K_OR, K_EXCLUSIVE, K_INTERSECT,
    K_UNION, K_TUPLE, K_REFINE, K_NOT,
    K_CONDITIONAL, K_ANY_INNER,
    K_VALIDATOR,
    V_MIN_LENGTH, V_MAX_LENGTH, V_PATTERN, V_FORMAT,
    V_MINIMUM, V_MAXIMUM, V_MULTIPLE_OF, V_EXCLUSIVE_MINIMUM, V_EXCLUSIVE_MAXIMUM,
    V_MIN_ITEMS, V_MAX_ITEMS, V_CONTAINS, V_MIN_CONTAINS, V_MAX_CONTAINS,
    V_UNIQUE_ITEMS, V_MIN_PROPERTIES, V_MAX_PROPERTIES, V_PATTERN_PROPERTIES, V_PROPERTY_NAMES,
    V_ADDITIONAL_PROPERTIES, V_DEPENDENT_REQUIRED,
    V_ENUM,
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
 * @param {!Array<RegExp>} cache — the regex cache to push into (REGEX_CACHE or S_REGEX_CACHE)
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
 * @param {*} ctx
 * @param {number} primConst
 * @param {boolean} scratch
 * @param {!Object=} opts
 * @returns {number}
 */
function valueImpl(ctx, primConst, scratch, opts) {
    if (opts === void 0) {
        return primConst;
    }
    let mask = (primConst & STRING) ? STR_MASK : NUM_MASK;
    let result = packValidators(opts, mask, null);
    let cache = scratch ? ctx.S_REGEX_CACHE : ctx.REGEX_CACHE;
    migrateRegex(result, cache);
    let vHeader = result[0];
    let payloads = result.slice(1);
    /** K_PRIMITIVE stores the validator index as inline (KINDS slot 1), no SLAB entry. */
    let valIdx = ctx.allocValidator(vHeader, payloads, scratch);
    return ctx.malloc(K_PRIMITIVE | K_VALIDATOR | primConst, scratch, valIdx, null, 0, 0, null);
}

/**
 * @param {*} ctx
 * @param {number} typedef
 * @param {function(*): boolean} fn
 * @param {boolean} scratch
 * @returns {number}
 */
function refineImpl(ctx, typedef, fn, scratch) {
    assertIsNumber(typedef, 0);
    let callbacks = scratch ? ctx.S_CALLBACKS : ctx.CALLBACKS;
    let callbackIdx = callbacks.push(fn) - 1;
    /** Store [innerType, callbackIdx] on SLAB; KINDS slot 1 = SHAPES index. */
    let slabData = new Uint32Array(2);
    slabData[0] = typedef >>> 0;
    slabData[1] = callbackIdx;
    let result = ctx.malloc(K_REFINE, scratch, 0, slabData, 2, 0, null);
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
 * @param {boolean} scratch
 * @returns {number}
 */
function tupleArrayImpl(ctx, types, scratch) {
    return ctx.malloc(K_TUPLE, scratch, 0, types, types.length, 0, null);
}

/**
 * Encodes a single literal value as a zero-allocation typedef.
 *   null    → NULLABLE pointer
 *   true    → TRUE primitive bit
 *   false   → FALSE primitive bit
 *   string  → K_PRIMITIVE | STRING | K_VALIDATOR with V_ENUM [1, keyId]
 *   number  → K_PRIMITIVE | NUMBER | K_VALIDATOR with V_ENUM [1, num]
 *   array   → K_TUPLE with each element recursively desugared
 *   object  → K_OBJECT with each property recursively desugared + additionalProperties:false
 * @param {*} ctx
 * @param {*} value
 * @param {boolean} scratch
 * @returns {number}
 */
function literalImpl(ctx, value, scratch) {
    if (value === null) { return NULLABLE; }
    if (value === true) { return TRUE; }
    if (value === false) { return FALSE; }
    if (typeof value === 'string') {
        let keyId = ctx.lookup(value);
        let valIdx = ctx.allocValidator(V_ENUM, [1, keyId], scratch);
        return ctx.malloc(K_PRIMITIVE | K_VALIDATOR | STRING, scratch, valIdx, null, 0, 0, null);
    }
    if (typeof value === 'number') {
        let valIdx = ctx.allocValidator(V_ENUM, [1, value], scratch);
        return ctx.malloc(K_PRIMITIVE | K_VALIDATOR | NUMBER, scratch, valIdx, null, 0, 0, null);
    }
    if (Array.isArray(value)) {
        /** Desugar to exact-length K_TUPLE: each element becomes its own literal type. */
        let elemTypes = new Array(value.length);
        for (let i = 0; i < value.length; i++) {
            elemTypes[i] = literalImpl(ctx, value[i], scratch);
        }
        return tupleArrayImpl(ctx, elemTypes, scratch);
    }
    if (typeof value === 'object') {
        /** Desugar to K_OBJECT with additionalProperties:false: each property is a literal type. */
        let keys = Object.keys(value);
        let def = {};
        for (let i = 0; i < keys.length; i++) {
            def[keys[i]] = literalImpl(ctx, value[keys[i]], scratch);
        }
        return objectImpl(ctx, def, scratch, { additionalProperties: false });
    }
    return NEVER;
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
 * @param {boolean} scratch
 * @returns {number}
 */
function enumImpl(ctx, values, scratch) {
    if (!Array.isArray(values) || values.length === 0) { return NEVER; }
    /** @type {string[]} */
    let strings = [];
    /** @type {number[]} */
    let numbers = [];
    let enumPrimBits = 0;
    /** @type {number[]} */
    let complexTypes = [];
    for (let i = 0; i < values.length; i++) {
        let v = values[i];
        if (v === null) { enumPrimBits |= NULLABLE; }
        else if (v === true) { enumPrimBits |= TRUE; }
        else if (v === false) { enumPrimBits |= FALSE; }
        else if (typeof v === 'string') { strings.push(v); }
        else if (typeof v === 'number') { numbers.push(v); }
        else { complexTypes.push(literalImpl(ctx, v, scratch)); }
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
        // Build K_PRIMITIVE with V_ENUM validator; re-attach NULLABLE / OPTIONAL on the pointer.
        let primBits = payloadBits & ~(NULLABLE | OPTIONAL);
        let valIdx = ctx.allocValidator(V_ENUM, payload, scratch);
        primType = ctx.malloc(K_PRIMITIVE | K_VALIDATOR | primBits, scratch, valIdx, null, 0, 0, null);
        if (payloadBits & NULLABLE) { primType = (primType | NULLABLE) >>> 0; }
        if (payloadBits & OPTIONAL) { primType = (primType | OPTIONAL) >>> 0; }
    } else if (payloadBits !== 0) {
        // Boolean/null only — no validator payload needed, raw bit flags suffice.
        primType = payloadBits >>> 0;
    }
    if (complexTypes.length === 0) { return primType; }
    // Rule C.2: mix of structural + primitive types → K_OR.
    let branches = complexTypes.slice();
    if (primType !== 0) { branches.unshift(primType); }
    return orImpl(ctx, branches, scratch);
}

/**
 * @param {*} ctx
 * @param {number} valueType
 * @param {boolean} scratch
 * @returns {number}
 */
function recordImpl(ctx, valueType, scratch) {
    assertIsNumber(valueType, 0);
    return ctx.malloc(K_RECORD, scratch, valueType >>> 0, null, 0, 0, null);
}

/**
 * @param {*} ctx
 * @param {!Array<number>} types
 * @param {boolean} scratch
 * @returns {number}
 */
function orImpl(ctx, types, scratch) {
    // Fast path: if all inputs are raw primitives (no COMPLEX bit),
    // just OR the bits together — no allocation needed.
    let allPrimitive = true;
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
        if (type & COMPLEX) {
            allPrimitive = false;
            break;
        }
        merged |= type;
    }
    if (allPrimitive) {
        return merged >>> 0;
    }
    let result = ctx.malloc(K_OR, scratch, 0, types, types.length, 0, null);
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
 * @param {boolean} scratch
 * @returns {number}
 */
function exclusiveImpl(ctx, types, scratch) {
    return ctx.malloc(K_EXCLUSIVE, scratch, 0, types, types.length, 0, null);
}

/**
 * @param {*} ctx
 * @param {!Array<number>} types
 * @param {boolean} scratch
 * @returns {number}
 */
function intersectImpl(ctx, types, scratch) {
    return ctx.malloc(K_INTERSECT, scratch, 0, types, types.length, 0, null);
}

/**
 * @param {*} ctx
 * @param {number} typedef
 * @param {boolean} scratch
 * @returns {number}
 */
function notImpl(ctx, typedef, scratch) {
    assertIsNumber(typedef, 0);
    return ctx.malloc(K_NOT, scratch, typedef >>> 0, null, 0, 0, null);
}

/**
 * @param {*} ctx
 * @param {!uvd.WhenValidators} config
 * @param {boolean} scratch
 * @returns {number}
 */
function whenImpl(ctx, config, scratch) {
    // Always store 3 slots: [if, then, else]
    // Use 0 as sentinel for "no constraint" (always passes)
    let types = [
        config.if >>> 0,
        config.then !== void 0 ? config.then >>> 0 : 0,
        config.else !== void 0 ? config.else >>> 0 : 0
    ];
    return ctx.malloc(K_CONDITIONAL, scratch, 0, types, types.length, 0, null);
}

/**
 * @template {symbol} R
 * @param {*} ctx
 * @param {uvd.Schema<R>} definition
 * @param {boolean} scratch
 * @param {uvd.ObjectValidators=} opts
 * @returns {number}
 */
function objectImpl(ctx, definition, scratch, opts) {
    let keys = Object.keys(definition);
    let count = keys.length;
    let required = count * 2;
    /** @type {Array<number>} */
    let resolved = new Array(required);
    for (let i = 0, j = 0; i < count; i++, j += 2) {
        let key = keys[i];
        let type = definition[key];
        if (isNumber(type)) {
            let isComplex = (type >>> 31) === 1;
            if (isComplex) {
                let payload = type & PRIM_MASK;
                let kindLimit = (type & SCRATCH) ? ctx.SCR_HEAP.KIND_PTR : ctx.HEAP.KIND_PTR;
                if (payload >= kindLimit) {
                    throw new Error('Object corruption at key ' + key + '. You cannot use the bitwise OR operator (|) to combine a complex type with a primitive type');
                }
            }
        } else if (isObject(type)) {
            type = objectImpl(ctx, /** @type {uvd.Schema<R>} */(type), scratch);
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
        let cache = scratch ? ctx.S_REGEX_CACHE : ctx.REGEX_CACHE;
        migrateRegex(result, cache);
        vHeader = result[0];
        payloads = result.slice(1);
    }
    let kindHeader = hasValidator ? (K_OBJECT | K_VALIDATOR) : K_OBJECT;
    return ctx.malloc(kindHeader, scratch, 0, resolved, count, vHeader, payloads);
}

/**
 * @param {*} ctx
 * @param {number} elemType
 * @param {boolean} scratch
 * @param {uvd.ArrayValidators=} opts
 * @returns {number}
 */
function arrayImpl(ctx, elemType, scratch, opts) {
    assertIsNumber(elemType, ERR_ARRAY_ELEMENT_MUST_BE_NUMBER);
    const hasVal = opts !== void 0;
    let vHeader = 0;
    let payloads = null;
    if (hasVal) {
        let result = packValidators(opts, ARR_MASK, null);
        vHeader = result[0];
        payloads = result.slice(1);
    }
    /** K_ARRAY stores elemType as inline (KINDS slot 1); no SLAB or SHAPES entry. */
    let kindHeader = hasVal ? (K_ARRAY | K_VALIDATOR) : K_ARRAY;
    return ctx.malloc(kindHeader, scratch, elemType >>> 0, null, 0, vHeader, payloads);
}

/**
 * @param {*} ctx
 * @param {string} discriminator
 * @param {!Object} variants
 * @param {boolean} scratch
 * @returns {number}
 */
function unionImpl(ctx, discriminator, variants, scratch) {
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
    return ctx.malloc(K_UNION, scratch, 0, slabData, count, 0, null);
}

// --- Allocator factories ---

function objectAllocator(cat) {
    let ctx = cat.__heap;
    return (def, opts) => objectImpl(ctx, def, false, opts);
}

function $objectAllocator(cat) {
    let ctx = cat.__heap;
    return (def, opts) => {
        if (ctx.rewindPending()) ctx.rewind();
        return objectImpl(ctx, def, true, opts);
    };
}

function arrayAllocator(cat) {
    let ctx = cat.__heap;
    return (type, opts) => arrayImpl(ctx, type, false, opts);
}

function $arrayAllocator(cat) {
    let ctx = cat.__heap;
    return (type, opts) => {
        if (ctx.rewindPending()) ctx.rewind();
        return arrayImpl(ctx, type, true, opts);
    };
}

function unionAllocator(cat) {
    let ctx = cat.__heap;
    return (disc, variants) => unionImpl(ctx, disc, variants, false);
}

function $unionAllocator(cat) {
    let ctx = cat.__heap;
    return (disc, variants) => {
        if (ctx.rewindPending()) ctx.rewind();
        return unionImpl(ctx, disc, variants, true);
    };
}

function valueAllocator(cat, primConst) {
    let ctx = cat.__heap;
    return (opts) => valueImpl(ctx, primConst, false, opts);
}

function $valueAllocator(cat, primConst) {
    let ctx = cat.__heap;
    return (opts) => {
        if (ctx.rewindPending()) ctx.rewind();
        return valueImpl(ctx, primConst, true, opts);
    };
}

function refineAllocator(cat) {
    let ctx = cat.__heap;
    return (typedef, fn) => refineImpl(ctx, typedef, fn, false);
}

function $refineAllocator(cat) {
    let ctx = cat.__heap;
    return (typedef, fn) => {
        if (ctx.rewindPending()) ctx.rewind();
        return refineImpl(ctx, typedef, fn, true);
    };
}

function tupleAllocator(cat) {
    let ctx = cat.__heap;
    return (first, second, third) => tupleArrayImpl(ctx, normalizeTypeArgs(first, second, third), false);
}

function $tupleAllocator(cat) {
    let ctx = cat.__heap;
    return (first, second, third) => {
        if (ctx.rewindPending()) ctx.rewind();
        return tupleArrayImpl(ctx, normalizeTypeArgs(first, second, third), true);
    };
}

function recordAllocator(cat) {
    let ctx = cat.__heap;
    return (valueType) => recordImpl(ctx, valueType, false);
}

function $recordAllocator(cat) {
    let ctx = cat.__heap;
    return (valueType) => {
        if (ctx.rewindPending()) ctx.rewind();
        return recordImpl(ctx, valueType, true);
    };
}

function orAllocator(cat) {
    let ctx = cat.__heap;
    return (first, second, third) => orImpl(ctx, normalizeTypeArgs(first, second, third), false);
}

function $orAllocator(cat) {
    let ctx = cat.__heap;
    return (first, second, third) => {
        if (ctx.rewindPending()) ctx.rewind();
        return orImpl(ctx, normalizeTypeArgs(first, second, third), true);
    };
}

function exclusiveAllocator(cat) {
    let ctx = cat.__heap;
    return (first, second, third) => exclusiveImpl(ctx, normalizeTypeArgs(first, second, third), false);
}

function $exclusiveAllocator(cat) {
    let ctx = cat.__heap;
    return (first, second, third) => {
        if (ctx.rewindPending()) ctx.rewind();
        return exclusiveImpl(ctx, normalizeTypeArgs(first, second, third), true);
    };
}

function intersectAllocator(cat) {
    let ctx = cat.__heap;
    return (first, second, third) => intersectImpl(ctx, normalizeTypeArgs(first, second, third), false);
}

function $intersectAllocator(cat) {
    let ctx = cat.__heap;
    return (first, second, third) => {
        if (ctx.rewindPending()) ctx.rewind();
        return intersectImpl(ctx, normalizeTypeArgs(first, second, third), true);
    };
}

function notAllocator(cat) {
    let ctx = cat.__heap;
    return (typedef) => notImpl(ctx, typedef, false);
}

function $notAllocator(cat) {
    let ctx = cat.__heap;
    return (typedef) => {
        if (ctx.rewindPending()) ctx.rewind();
        return notImpl(ctx, typedef, true);
    };
}

function whenAllocator(cat) {
    let ctx = cat.__heap;
    return (config) => whenImpl(ctx, config, false);
}

function $whenAllocator(cat) {
    let ctx = cat.__heap;
    return (config) => {
        if (ctx.rewindPending()) ctx.rewind();
        return whenImpl(ctx, config, true);
    };
}

// --- Convenience bundles ---

function allocators(cat) {
    let ctx = cat.__heap;
    return {
        object: (def, opts) => objectImpl(ctx, def, false, opts),
        array: (type, opts) => arrayImpl(ctx, type, false, opts),
        union: (disc, variants) => unionImpl(ctx, disc, variants, false),
        string: (opts) => valueImpl(ctx, STRING, false, opts),
        number: (opts) => valueImpl(ctx, NUMBER, false, opts),
        boolean: (opts) => valueImpl(ctx, BOOLEAN, false, opts),
        bigint: (opts) => valueImpl(ctx, BIGINT, false, opts),
        date: (opts) => valueImpl(ctx, DATE, false, opts),
        uri: (opts) => valueImpl(ctx, URI, false, opts),
        refine: (typedef, fn) => refineImpl(ctx, typedef, fn, false),
        tuple: (first, second, third) => tupleArrayImpl(ctx, normalizeTypeArgs(first, second, third), false),
        record: (valueType) => recordImpl(ctx, valueType, false),
        or: (first, second, third) => orImpl(ctx, normalizeTypeArgs(first, second, third), false),
        exclusive: (first, second, third) => exclusiveImpl(ctx, normalizeTypeArgs(first, second, third), false),
        intersect: (first, second, third) => intersectImpl(ctx, normalizeTypeArgs(first, second, third), false),
        not: (typedef) => notImpl(ctx, typedef, false),
        when: (config) => whenImpl(ctx, config, false),
        literal: (value) => literalImpl(ctx, value, false),
        enum: (values) => enumImpl(ctx, values, false),
        optional,
        nullable,
    };
}

function $allocators(cat) {
    let ctx = cat.__heap;
    let rp = ctx.rewindPending;
    let rw = ctx.rewind;
    return {
        $object: (def, opts) => { if (rp()) rw(); return objectImpl(ctx, def, true, opts); },
        $array: (type, opts) => { if (rp()) rw(); return arrayImpl(ctx, type, true, opts); },
        $union: (disc, variants) => { if (rp()) rw(); return unionImpl(ctx, disc, variants, true); },
        $string: (opts) => { if (rp()) rw(); return valueImpl(ctx, STRING, true, opts); },
        $number: (opts) => { if (rp()) rw(); return valueImpl(ctx, NUMBER, true, opts); },
        $boolean: (opts) => { if (rp()) rw(); return valueImpl(ctx, BOOLEAN, true, opts); },
        $bigint: (opts) => { if (rp()) rw(); return valueImpl(ctx, BIGINT, true, opts); },
        $date: (opts) => { if (rp()) rw(); return valueImpl(ctx, DATE, true, opts); },
        $uri: (opts) => { if (rp()) rw(); return valueImpl(ctx, URI, true, opts); },
        $refine: (typedef, fn) => { if (rp()) rw(); return refineImpl(ctx, typedef, fn, true); },
        $tuple: (first, second, third) => { if (rp()) rw(); return tupleArrayImpl(ctx, normalizeTypeArgs(first, second, third), true); },
        $record: (valueType) => { if (rp()) rw(); return recordImpl(ctx, valueType, true); },
        $or: (first, second, third) => { if (rp()) rw(); return orImpl(ctx, normalizeTypeArgs(first, second, third), true); },
        $exclusive: (first, second, third) => { if (rp()) rw(); return exclusiveImpl(ctx, normalizeTypeArgs(first, second, third), true); },
        $intersect: (first, second, third) => { if (rp()) rw(); return intersectImpl(ctx, normalizeTypeArgs(first, second, third), true); },
        $not: (typedef) => { if (rp()) rw(); return notImpl(ctx, typedef, true); },
        $when: (config) => { if (rp()) rw(); return whenImpl(ctx, config, true); },
        $literal: (value) => { if (rp()) rw(); return literalImpl(ctx, value, true); },
        $enum: (values) => { if (rp()) rw(); return enumImpl(ctx, values, true); },
        optional,
        nullable,
    };
}

export {
    allocators, $allocators,
    objectAllocator, $objectAllocator,
    arrayAllocator, $arrayAllocator,
    unionAllocator, $unionAllocator,
    valueAllocator, $valueAllocator,
    refineAllocator, $refineAllocator,
    tupleAllocator, $tupleAllocator,
    recordAllocator, $recordAllocator,
    orAllocator, $orAllocator,
    exclusiveAllocator, $exclusiveAllocator,
    intersectAllocator, $intersectAllocator,
    notAllocator, $notAllocator,
    whenAllocator, $whenAllocator,
};
