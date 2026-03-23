/// <reference path="../../global.d.ts" />
import {
    COMPLEX, NULLABLE, OPTIONAL, SCRATCH,
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
    let valIdx = ctx.allocValidator(vHeader, payloads, scratch);
    let kindHeader = K_PRIMITIVE | K_VALIDATOR | primConst;
    let ptr = ctx.allocKind(kindHeader, valIdx, scratch, 2);
    return (COMPLEX | (scratch ? SCRATCH : 0) | ptr) >>> 0;
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
    let kindPtr = ctx.allocKind(K_REFINE, typedef >>> 0, scratch, 3);
    let HEAP = scratch ? ctx.SCR_HEAP : ctx.HEAP;
    let kinds = HEAP.KINDS;
    kinds[kindPtr + 2] = callbackIdx;
    let flags = COMPLEX | kindPtr;
    if (scratch) {
        flags |= SCRATCH;
    }
    if (typedef & NULLABLE) {
        flags |= NULLABLE;
    }
    if (typedef & OPTIONAL) {
        flags |= OPTIONAL;
    }
    return flags >>> 0;
}

/**
 * @param {*} ctx
 * @param {!Array<number>} types
 * @param {boolean} scratch
 * @returns {number}
 */
function tupleArrayImpl(ctx, types, scratch) {
    let id = ctx.allocOnSlab(types, scratch, 'tuple');
    let kindPtr = ctx.allocKind(K_TUPLE, id, scratch, 2);
    return (COMPLEX | (scratch ? SCRATCH : 0) | kindPtr) >>> 0;
}

/**
 * @param {*} ctx
 * @param {number} valueType
 * @param {boolean} scratch
 * @returns {number}
 */
function recordImpl(ctx, valueType, scratch) {
    assertIsNumber(valueType, 0);
    let kindPtr = ctx.allocKind(K_RECORD, valueType >>> 0, scratch, 2);
    return (COMPLEX | (scratch ? SCRATCH : 0) | kindPtr) >>> 0;
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
    let flags = COMPLEX | (scratch ? SCRATCH : 0)
    let length = types.length;
    for (let i = 0; i < length; i++, j++) {
        const type = /** @type {number} */(types[i]);
        if (type & NULLABLE) {
            flags |= NULLABLE;
        }
        if (type & OPTIONAL) {
            flags |= OPTIONAL;
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
    let id = ctx.allocOnSlab(types, scratch, 'match');
    let kindPtr = ctx.allocKind(K_OR, id, scratch, 2);
    flags |= kindPtr;
    for (; j < length; j++) {
        const type = /** @type {number} */(types[j]);
        if (type & NULLABLE) {
            flags |= NULLABLE;
        }
        if (type & OPTIONAL) {
            flags |= OPTIONAL;
        }
    }
    return flags >>> 0;
}

/**
 * @param {*} ctx
 * @param {!Array<number>} types
 * @param {boolean} scratch
 * @returns {number}
 */
function exclusiveImpl(ctx, types, scratch) {
    let id = ctx.allocOnSlab(types, scratch, 'match');
    let kindPtr = ctx.allocKind(K_EXCLUSIVE, id, scratch, 2);
    return (COMPLEX | (scratch ? SCRATCH : 0) | kindPtr) >>> 0;
}

/**
 * @param {*} ctx
 * @param {!Array<number>} types
 * @param {boolean} scratch
 * @returns {number}
 */
function intersectImpl(ctx, types, scratch) {
    let id = ctx.allocOnSlab(types, scratch, 'match');
    let kindPtr = ctx.allocKind(K_INTERSECT, id, scratch, 2);
    return (COMPLEX | (scratch ? SCRATCH : 0) | kindPtr) >>> 0;
}

/**
 * @param {*} ctx
 * @param {number} typedef
 * @param {boolean} scratch
 * @returns {number}
 */
function notImpl(ctx, typedef, scratch) {
    assertIsNumber(typedef, 0);
    let kindPtr = ctx.allocKind(K_NOT, typedef >>> 0, scratch, 2);
    return (COMPLEX | (scratch ? SCRATCH : 0) | kindPtr) >>> 0;
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
    let id = ctx.allocOnSlab(types, scratch, 'match');
    let kindPtr = ctx.allocKind(K_CONDITIONAL, id, scratch, 2);
    return (COMPLEX | (scratch ? SCRATCH : 0) | kindPtr) >>> 0;
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
    let valIdx = 0;
    const hasValidator = opts !== void 0;
    if (hasValidator) {
        let result = packValidators(opts, OBJ_MASK, ctx.lookup);
        let cache = scratch ? ctx.S_REGEX_CACHE : ctx.REGEX_CACHE;
        migrateRegex(result, cache);
        let vHeader = result[0];
        let payloads = result.slice(1);
        valIdx = ctx.allocValidator(vHeader, payloads, scratch);
    }
    let id = ctx.registerObject(resolved, count, scratch);
    let kindHeader = hasValidator ? (K_OBJECT | K_VALIDATOR) : K_OBJECT;
    let slots = hasValidator ? 3 : 2;
    let kindPtr = ctx.allocKind(kindHeader, id, scratch, slots);
    if (hasValidator) {
        let HEAP = scratch ? ctx.SCR_HEAP : ctx.HEAP;
        let kinds = HEAP.KINDS;
        kinds[kindPtr + 2] = valIdx;
    }
    return (COMPLEX | (scratch ? SCRATCH : 0) | kindPtr) >>> 0;
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
    let valIdx = 0;
    if (hasVal) {
        let result = packValidators(opts, ARR_MASK, null);
        let vHeader = result[0];
        let payloads = result.slice(1);
        valIdx = ctx.allocValidator(vHeader, payloads, scratch);
    }
    let index = ctx.registerArray(elemType, scratch);
    let kindHeader = hasVal ? (K_ARRAY | K_VALIDATOR) : K_ARRAY;
    let slots = hasVal ? 3 : 2;
    let kindPtr = ctx.allocKind(kindHeader, index, scratch, slots);
    if (hasVal) {
        let HEAP = scratch ? ctx.SCR_HEAP : ctx.HEAP;
        let kinds = HEAP.KINDS;
        kinds[kindPtr + 2] = valIdx;
    }
    return (COMPLEX | (scratch ? SCRATCH : 0) | kindPtr) >>> 0;
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
    let id = ctx.registerUnion(resolved, count, discKeyId, scratch);
    let kindId = ctx.allocKind(K_UNION, id, scratch, 2);
    return (COMPLEX | (scratch ? SCRATCH : 0) | kindId) >>> 0;
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
