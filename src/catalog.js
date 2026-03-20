/// <reference path="../global.d.ts" />
import { config, malloc } from './config.js';
import {
    COMPLEX, NULLABLE, OPTIONAL, VOLATILE,
    BOOLEAN, NUMBER, STRING, BIGINT, DATE,
    URI, INTEGER, PRIMITIVE, PRIM_MASK, KIND_MASK,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_UNION,
    K_REFINE, K_TUPLE, K_RECORD, K_OR, K_EXCLUSIVE,
    K_INTERSECT, K_NOT, K_CONDITIONAL,
    KIND_ENUM_MASK, HAS_VALIDATOR,
    STR_MIN_LENGTH, STR_MAX_LENGTH, STR_PATTERN, STR_FORMAT,
    NUM_MINIMUM, NUM_MAXIMUM, NUM_EX_MIN, NUM_EX_MAX, NUM_MULTIPLE_OF,
    ARR_MIN_ITEMS, ARR_MAX_ITEMS, ARR_UNIQUE, ARR_CONTAINS, ARR_MIN_CONTAINS,
    ARR_MAX_CONTAINS, OBJ_MIN_PROPS, OBJ_MAX_PROPS, OBJ_PATTERN_PROPS,
    OBJ_PROP_NAMES, OBJ_DEP_REQUIRED, OBJ_NO_ADDITIONAL,
    FMT_EMAIL, FMT_IPV4, FMT_UUID, FMT_DATETIME, FMT_MAP,
    FMT_RE_EMAIL, FMT_RE_IPV4, FMT_RE_UUID, FMT_RE_DATETIME,
    STRIP, PLAIN, NOT_STRICT, STRICT_REJECT, STRICT_DELETE, STRICT_PROTO,
    STRICT_MODE_MASK, U8, U16, U32, FAIL
} from './const.js';
import {
    assert, assertIsNumber, assertIsObject,
    ERR_ARRAY_ELEMENT_MUST_BE_NUMBER,
    ERR_CONFIG_FIELD_MUST_BE_NUMBER
} from './error.js';
import {
    nullable, optional, isNumber, isObject,
    sortByKeyId, parseValue, _isValue, describeType
} from './util.js';

const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * @template R
 * @param {uvd.cat.Config=} cfg 
 */
function catalog(cfg) {
    cfg = config(cfg);
    let HEAP = malloc(cfg.t);
    let VOL_HEAP = malloc(cfg.v);

    // Primary heap store
    let SLAB = HEAP.SLAB;
    let OBJECTS = HEAP.OBJECTS;
    let ARRAYS = HEAP.ARRAYS;
    let UNIONS = HEAP.UNIONS;
    let TUPLES = HEAP.TUPLES;
    let MATCHES = HEAP.MATCHES;
    let KINDS = HEAP.KINDS;
    let VALIDATORS = HEAP.VALIDATORS;
    let REGEX_CACHE = HEAP.REGEX_CACHE;
    let CALLBACKS = HEAP.CALLBACKS;

    // Volatile heap store
    let V_SLAB = VOL_HEAP.SLAB;
    let V_OBJECTS = VOL_HEAP.OBJECTS;
    let V_ARRAYS = VOL_HEAP.ARRAYS;
    let V_UNIONS = VOL_HEAP.UNIONS;
    let V_TUPLES = VOL_HEAP.TUPLES;
    let V_MATCHES = VOL_HEAP.MATCHES;
    let V_KINDS = VOL_HEAP.KINDS;
    let V_VALIDATORS = VOL_HEAP.VALIDATORS;
    let V_REGEX_CACHE = VOL_HEAP.REGEX_CACHE;
    let V_CALLBACKS = VOL_HEAP.CALLBACKS;

    // --- KEY DICTIONARY (shared between permanent and volatile) ---
    /** @type {number} */
    let keyseq = 1;
    /** @const @type {!Map<string,number>} */
    let KEY_DICT = new Map();
    /** @const @type {!Map<number,string>} */
    let KEY_INDEX = new Map();

    let rewindPending = false;

    /**
     * @returns {void}
     */
    function rewindVolatile() {
        VOL_HEAP.PTR = 0;
        VOL_HEAP.OBJ_COUNT = 0;
        VOL_HEAP.ARR_COUNT = 0;
        VOL_HEAP.TUP_COUNT = 0;
        VOL_HEAP.MAT_COUNT = 0;
        VOL_HEAP.UNION_COUNT = 0;
        VOL_HEAP.KIND_PTR = 0;
        VOL_HEAP.VAL_PTR = 0;
        V_REGEX_CACHE.length = 0;
        V_CALLBACKS.length = 0;
        rewindPending = false;
    }

    /**
     * @param {string} key
     * @returns {number}
     */
    function lookup(key) {
        let id = KEY_DICT.get(key);
        if (id === void 0) {
            id = keyseq++;
            KEY_DICT.set(key, id);
            KEY_INDEX.set(id, key);
        }
        return id;
    }

    /**
     * @param {number} header
     * @param {number} registryIndex
     * @param {boolean} volatile
     * @param {number} slots
     * @returns {number}
     */
    function allocKind(header, registryIndex, volatile, slots) {
        if (volatile) {
            let ptr = VOL_HEAP.KIND_PTR;
            if (ptr + slots > VOL_HEAP.KIND_LEN) {
                let buffer = new Uint32Array(VOL_HEAP.KIND_LEN *= 2);
                buffer.set(V_KINDS);
                VOL_HEAP.KINDS = V_KINDS = buffer;
            }
            V_KINDS[ptr] = header;
            V_KINDS[ptr + 1] = registryIndex;
            VOL_HEAP.KIND_PTR += slots;
            return ptr;
        }
        let ptr = HEAP.KIND_PTR;
        if (ptr + slots > HEAP.KIND_LEN) {
            let buffer = new Uint32Array(HEAP.KIND_LEN *= 2);
            buffer.set(KINDS);
            HEAP.KINDS = KINDS = buffer;
        }
        KINDS[ptr] = header;
        KINDS[ptr + 1] = registryIndex;
        HEAP.KIND_PTR += slots;
        return ptr;
    }

    /**
     * @param {number} vHeader
     * @param {!Array<number>} payloads
     * @param {boolean} volatile
     * @returns {number}
     */
    function allocValidator(vHeader, payloads, volatile) {
        let needed = 1 + payloads.length;
        if (volatile) {
            if (VOL_HEAP.VAL_PTR + needed > VOL_HEAP.VAL_LEN) {
                let buffer = new Float64Array(VOL_HEAP.VAL_LEN *= 2);
                buffer.set(V_VALIDATORS);
                VOL_HEAP.VALIDATORS = V_VALIDATORS = buffer;
            }
            let ptr = VOL_HEAP.VAL_PTR;
            V_VALIDATORS[ptr] = vHeader;
            for (let i = 0; i < payloads.length; i++) {
                V_VALIDATORS[ptr + 1 + i] = payloads[i];
            }
            VOL_HEAP.VAL_PTR += needed;
            return ptr;
        }
        if (HEAP.VAL_PTR + needed > HEAP.VAL_LEN) {
            let buffer = new Float64Array(HEAP.VAL_LEN *= 2);
            buffer.set(VALIDATORS);
            HEAP.VALIDATORS = VALIDATORS = buffer;
        }
        let ptr = HEAP.VAL_PTR;
        VALIDATORS[ptr] = vHeader;
        for (let i = 0; i < payloads.length; i++) {
            VALIDATORS[ptr + 1 + i] = payloads[i];
        }
        HEAP.VAL_PTR += needed;
        return ptr;
    }

    /**
     * @param {number} primConst
     * @param {!uvd.cat.Validators} opts
     * @param {boolean} volatile
     * @returns {{vHeader: number, payloads: !Array<number>}}
     */
    function buildValidatorPayload(primConst, opts, volatile) {
        let vHeader = 0;
        /** @type {!Array<number>} */
        let payloads = [];
        if (primConst & STRING) {
            const strOpts = /** @type {uvd.cat.StringValidators} */(opts);
            if (strOpts.minLength !== void 0) {
                vHeader |= STR_MIN_LENGTH;
                payloads.push(strOpts.minLength);
            }
            if (strOpts.maxLength !== void 0) {
                vHeader |= STR_MAX_LENGTH;
                payloads.push(strOpts.maxLength);
            }
            if (strOpts.pattern !== void 0) {
                vHeader |= STR_PATTERN;
                let cache = volatile ? V_REGEX_CACHE : REGEX_CACHE;
                let idx = cache.push(strOpts.pattern instanceof RegExp ? strOpts.pattern : new RegExp(strOpts.pattern)) - 1;
                payloads.push(idx);
            }
            if (strOpts.format !== void 0) {
                let fmt = FMT_MAP[strOpts.format];
                if (fmt === void 0) {
                    throw new Error('Unknown string format: ' + strOpts.format);
                }
                vHeader |= STR_FORMAT;
                payloads.push(fmt);
            }
        } else if (primConst & NUMBER) {
            const nbrOpts = /** @type {!uvd.cat.NumberValidators} */(opts);
            if (nbrOpts.minimum !== void 0) {
                vHeader |= NUM_MINIMUM;
                payloads.push(nbrOpts.minimum);
            }
            if (nbrOpts.maximum !== void 0) {
                vHeader |= NUM_MAXIMUM;
                payloads.push(nbrOpts.maximum);
            }
            if (nbrOpts.exclusiveMinimum !== void 0) {
                vHeader |= NUM_EX_MIN;
                payloads.push(nbrOpts.exclusiveMinimum);
            }
            if (nbrOpts.exclusiveMaximum !== void 0) {
                vHeader |= NUM_EX_MAX;
                payloads.push(nbrOpts.exclusiveMaximum);
            }
            if (nbrOpts.multipleOf !== void 0) {
                vHeader |= NUM_MULTIPLE_OF;
                payloads.push(nbrOpts.multipleOf);
            }
        }
        return { vHeader, payloads };
    }

    /**
     * @param {number} primConst
     * @returns {function(!Object=): number}
     */
    function primitiveImpl(primConst) {
        return function (opts) {
            if (opts === void 0) {
                return primConst;
            }
            let { vHeader, payloads } = buildValidatorPayload(primConst, opts, false);
            let valIdx = allocValidator(vHeader, payloads, false);
            let kindHeader = K_PRIMITIVE | HAS_VALIDATOR | primConst;
            let ptr = allocKind(kindHeader, valIdx, false, 2);
            return (COMPLEX | ptr) >>> 0;
        };
    }

    /**
     * @param {number} primConst
     * @returns {function(!Object=): number}
     */
    function volatilePrimitiveImpl(primConst) {
        return function (opts) {
            if (opts === void 0) {
                return primConst;
            }
            if (rewindPending) {
                rewindVolatile();
            }
            let { vHeader, payloads } = buildValidatorPayload(primConst, opts, true);
            let valIdx = allocValidator(vHeader, payloads, true);
            let kindHeader = K_PRIMITIVE | HAS_VALIDATOR | primConst;
            let ptr = allocKind(kindHeader, valIdx, true, 2);
            return (COMPLEX | VOLATILE | ptr) >>> 0;
        };
    }

    /**
     * @template T
     * @param {uvd.cat.Type<T,R>} typedef
     * @param {function(*): boolean} fn
     * @param {boolean} volatile
     * @returns {uvd.cat.Complex<T, R>}
     */
    function refineImpl(typedef, fn, volatile) {
        assertIsNumber(typedef, 0);
        let callbacks = volatile ? V_CALLBACKS : CALLBACKS;
        let callbackIdx = callbacks.push(fn) - 1;
        let kindPtr = allocKind(K_REFINE, typedef >>> 0, volatile, 3);
        let kinds = volatile ? V_KINDS : KINDS;
        kinds[kindPtr + 2] = callbackIdx;
        let flags = COMPLEX | kindPtr;
        if (volatile) {
            flags |= VOLATILE;
        }
        if (typedef & NULLABLE) {
            flags |= NULLABLE;
        }
        if (typedef & OPTIONAL) {
            flags |= OPTIONAL;
        }
        //@ts-ignore
        return flags >>> 0;
    }

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

    /**
     * Allocate entries on the SLAB and register in a typed registry (TUPLES or MATCHES).
     * @param {!Array<number>} types
     * @param {boolean} volatile
     * @param {string} kind - 'tuple' or 'match'
     * @returns {number} registry index
     */
    function allocOnSlab(types, volatile, kind) {
        let count = types.length;
        let heap = volatile ? VOL_HEAP : HEAP;
        let slab = volatile ? V_SLAB : SLAB;
        let ptr = heap.PTR;

        // Grow slab if needed
        if (volatile) {
            if (ptr + count > VOL_HEAP.SLAB_LEN) {
                let buffer = new Uint32Array(VOL_HEAP.SLAB_LEN *= 2);
                buffer.set(V_SLAB);
                VOL_HEAP.SLAB = V_SLAB = buffer;
                slab = V_SLAB;
            }
        } else {
            if (ptr + count > HEAP.SLAB_LEN) {
                let buffer = new Uint32Array(HEAP.SLAB_LEN *= 2);
                buffer.set(SLAB);
                HEAP.SLAB = SLAB = buffer;
                slab = SLAB;
            }
        }

        let offset = ptr;
        for (let i = 0; i < count; i++) {
            slab[offset + i] = types[i] >>> 0;
        }

        heap.PTR += count;

        // Register in the appropriate registry
        if (kind === 'tuple') {
            let tuples = volatile ? V_TUPLES : TUPLES;
            let id = heap.TUP_COUNT++;

            if ((id + 1) * 2 > heap.TUP_LEN) {
                if (volatile) {
                    let buffer = VOL_HEAP.TUP_TYPE === U16 ?
                        new Uint16Array(VOL_HEAP.TUP_LEN *= 2) :
                        new Uint32Array(VOL_HEAP.TUP_LEN *= 2);
                    buffer.set(V_TUPLES);
                    VOL_HEAP.TUPLES = V_TUPLES = buffer;
                    tuples = V_TUPLES;
                } else {
                    let buffer = HEAP.TUP_TYPE === U16 ?
                        new Uint16Array(HEAP.TUP_LEN *= 2) :
                        new Uint32Array(HEAP.TUP_LEN *= 2);
                    buffer.set(TUPLES);
                    HEAP.TUPLES = TUPLES = buffer;
                    tuples = TUPLES;
                }
            }

            // Check U16 overflow
            if (volatile) {
                if (VOL_HEAP.TUP_TYPE === U16 && offset > 65535) {
                    let buffer = new Uint32Array(VOL_HEAP.TUP_LEN);
                    buffer.set(V_TUPLES);
                    VOL_HEAP.TUPLES = V_TUPLES = buffer;
                    VOL_HEAP.TUP_TYPE = U32;
                    tuples = V_TUPLES;
                }
            } else {
                if (HEAP.TUP_TYPE === U16 && offset > 65535) {
                    let buffer = new Uint32Array(HEAP.TUP_LEN);
                    buffer.set(TUPLES);
                    HEAP.TUPLES = TUPLES = buffer;
                    HEAP.TUP_TYPE = U32;
                    tuples = TUPLES;
                }
            }

            tuples[id * 2] = offset;
            tuples[id * 2 + 1] = count;
            return id;
        }

        // kind === 'match'
        let matches = volatile ? V_MATCHES : MATCHES;
        let id = heap.MAT_COUNT++;

        if ((id + 1) * 2 > heap.MAT_LEN) {
            if (volatile) {
                let buffer = VOL_HEAP.MAT_TYPE === U16 ?
                    new Uint16Array(VOL_HEAP.MAT_LEN *= 2) :
                    new Uint32Array(VOL_HEAP.MAT_LEN *= 2);
                buffer.set(V_MATCHES);
                VOL_HEAP.MATCHES = V_MATCHES = buffer;
                matches = V_MATCHES;
            } else {
                let buffer = HEAP.MAT_TYPE === U16 ?
                    new Uint16Array(HEAP.MAT_LEN *= 2) :
                    new Uint32Array(HEAP.MAT_LEN *= 2);
                buffer.set(MATCHES);
                HEAP.MATCHES = MATCHES = buffer;
                matches = MATCHES;
            }
        }

        if (volatile) {
            if (VOL_HEAP.MAT_TYPE === U16 && offset > 65535) {
                let buffer = new Uint32Array(VOL_HEAP.MAT_LEN);
                buffer.set(V_MATCHES);
                VOL_HEAP.MATCHES = V_MATCHES = buffer;
                VOL_HEAP.MAT_TYPE = U32;
                matches = V_MATCHES;
            }
        } else {
            if (HEAP.MAT_TYPE === U16 && offset > 65535) {
                let buffer = new Uint32Array(HEAP.MAT_LEN);
                buffer.set(MATCHES);
                HEAP.MATCHES = MATCHES = buffer;
                HEAP.MAT_TYPE = U32;
                matches = MATCHES;
            }
        }

        matches[id * 2] = offset;
        matches[id * 2 + 1] = count;
        return id;
    }

    // /**
    //  * @param {number} first
    //  * @param {number} second
    //  * @param {number | undefined} third
    //  * @param {boolean} volatile
    //  * @returns {number}
    //  */
    // function tupleImpl(first, second, third, volatile) {
    //     // TODO
    //     // let id = allocOnSlab(types, volatile, 'tuple');
    //     // let kindPtr = allocKind(K_TUPLE, id, volatile, 2);
    //     // return (COMPLEX | (volatile ? VOLATILE : 0) | kindPtr) >>> 0;
    // }

    /**
     * @template T
     * @param {!Array<number>} types
     * @param {boolean} volatile
     * @returns {uvd.cat.Complex<T>}
     */
    function tupleArrayImpl(types, volatile) {
        let id = allocOnSlab(types, volatile, 'tuple');
        let kindPtr = allocKind(K_TUPLE, id, volatile, 2);
        //@ts-ignore
        return (COMPLEX | (volatile ? VOLATILE : 0) | kindPtr) >>> 0;
    }

    /**
     * @template T
     * @param {uvd.cat.Type<T,R>} valueType
     * @param {boolean} volatile
     * @returns {uvd.cat.Complex<Record<string,T>,R>}
     */
    function recordImpl(valueType, volatile) {
        assertIsNumber(valueType, 0);
        let kindPtr = allocKind(K_RECORD, valueType >>> 0, volatile, 2);
        //@ts-ignore
        return (COMPLEX | (volatile ? VOLATILE : 0) | kindPtr) >>> 0;
    }

    /**
     * @template T
     * @param {!Array<number>} types
     * @param {boolean} volatile
     * @returns {uvd.cat.Complex<T,R>}
     */
    function orImpl(types, volatile) {
        // Fast path: if all inputs are raw primitives (no COMPLEX bit),
        // just OR the bits together — no allocation needed.
        let allPrimitive = true;
        let merged = 0;
        let length = types.length;
        for (let i = 0; i < length; i++) {
            if (types[i] & COMPLEX) {
                allPrimitive = false;
                break;
            }
            merged |= types[i];
        }
        if (allPrimitive) {
            //@ts-ignore
            return merged >>> 0;
        }
        let id = allocOnSlab(types, volatile, 'match');
        let kindPtr = allocKind(K_OR, id, volatile, 2);
        let flags = COMPLEX | (volatile ? VOLATILE : 0) | kindPtr;
        for (let i = 0; i < length; i++) {
            if (types[i] & NULLABLE) flags |= NULLABLE;
            if (types[i] & OPTIONAL) flags |= OPTIONAL;
        }
        //@ts-ignore
        return flags >>> 0;
    }

    /**
     * @template T
     * @param {!Array<number>} types
     * @param {boolean} volatile
     * @returns {uvd.cat.Complex<T,R>}
     */
    function exclusiveImpl(types, volatile) {
        let id = allocOnSlab(types, volatile, 'match');
        let kindPtr = allocKind(K_EXCLUSIVE, id, volatile, 2);
        //@ts-ignore
        return (COMPLEX | (volatile ? VOLATILE : 0) | kindPtr) >>> 0;
    }

    /**
     * @template T
     * @param {Array<number>} types
     * @param {boolean} volatile
     * @returns {uvd.cat.Complex<T,R>}
     */
    function intersectImpl(types, volatile) {
        let id = allocOnSlab(types, volatile, 'match');
        let kindPtr = allocKind(K_INTERSECT, id, volatile, 2);
        //@ts-ignore
        return (COMPLEX | (volatile ? VOLATILE : 0) | kindPtr) >>> 0;
    }

    /**
     * @template T
     * @param {uvd.cat.Type<T,R>} typedef
     * @param {boolean} volatile
     * @returns {uvd.cat.Complex<T,R>}
     */
    function notImpl(typedef, volatile) {
        assertIsNumber(typedef, 0);
        let kindPtr = allocKind(K_NOT, typedef >>> 0, volatile, 2);
        //@ts-ignore
        return (COMPLEX | (volatile ? VOLATILE : 0) | kindPtr) >>> 0;
    }

    /**
     * @template T
     * @param {uvd.cat.WhenValidators} config
     * @param {boolean} volatile
     * @returns {uvd.cat.Complex<T,R>}
     */
    function whenImpl(config, volatile) {
        // Always store 3 slots: [if, then, else]
        // Use 0 as sentinel for "no constraint" (always passes)
        let types = [
            config.if >>> 0,
            config.then !== void 0 ? config.then >>> 0 : 0,
            config.else !== void 0 ? config.else >>> 0 : 0
        ];
        let id = allocOnSlab(types, volatile, 'match');
        let kindPtr = allocKind(K_CONDITIONAL, id, volatile, 2);
        //@ts-ignore
        return (COMPLEX | (volatile ? VOLATILE : 0) | kindPtr) >>> 0;
    }



    // --- SCHEMA BUILDERS ---

    /**
     * @throws
     * @template T
     * @param {uvd.cat.Schema<R>} definition
     * @param {boolean} volatile
     * @param {uvd.cat.ObjectValidators=} opts
     * @returns {uvd.cat.Complex<uvd.cat.InferSchema<T>, R>}
     */
    function objectImpl(definition, volatile, opts) {
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
                    // Strip the top 4 bits to get the raw payload
                    let payload = type & PRIM_MASK;

                    // If they OR'd a primitive, the payload will be artificially massive
                    let kindLimit = (type & VOLATILE) ? VOL_HEAP.KIND_PTR : HEAP.KIND_PTR;
                    if (payload >= kindLimit) {
                        throw new Error('Object corruption at key ' + key + '. You cannot use the bitwise OR operator (|) to combine a complex type with a primitive type');
                    }
                }
            } else if (isObject(type)) {
                type = objectImpl(/** @type {uvd.cat.Schema<R>} */(type), volatile);
            } else {
                throw new Error('Invalid type for key ' + key);
            }
            resolved[j] = lookup(key);
            resolved[j + 1] = /** @type {number} */(type) >>> 0;
        }
        /**
         * Every object is stored sorted by keyId into the slab storage.
         * The entire object is placed like this:
         * 
         * [keyId, typedef, keyId, typedef, keyId, typedef]
         *  
         * This allows us to use binary search against keys to avoid allocating Maps,
         * but likely we can come up with more use cases for this later as well.
         */
        sortByKeyId(resolved);
        let valIdx = 0;
        const hasValidator = opts !== void 0;
        if (hasValidator) {
            let vHeader = 0;
            /** @type {!Array<number>} */
            let payloads = [];
            const minProperties = opts.minProperties;
            if (minProperties !== void 0) {
                assertIsNumber(minProperties, 0);
                vHeader |= OBJ_MIN_PROPS;
                payloads.push(minProperties);
            }
            const maxProperties = opts.maxProperties;
            if (maxProperties !== void 0) {
                assertIsNumber(maxProperties, 0);
                vHeader |= OBJ_MAX_PROPS;
                payloads.push(maxProperties);
            }
            const patternProperties = opts.patternProperties;
            if (patternProperties !== void 0) {
                assertIsObject(patternProperties, 0);
                vHeader |= OBJ_PATTERN_PROPS;
                let patterns = Object.keys(patternProperties);
                let cache = volatile ? V_REGEX_CACHE : REGEX_CACHE;
                payloads.push(patterns.length);
                for (let i = 0; i < patterns.length; i++) {
                    const pattern = patterns[i];
                    const match = patternProperties[pattern];
                    assertIsNumber(match, 0); 
                    let re = new RegExp(patterns[i]);
                    let idx = cache.push(re) - 1;
                    payloads.push(idx);
                    payloads.push(match >>> 0);
                }
            }
            const propertyNames = opts.propertyNames;
            if (propertyNames !== void 0) {
                assertIsNumber(propertyNames, 0);
                vHeader |= OBJ_PROP_NAMES;
                payloads.push(propertyNames >>> 0);
            }
            if (opts.dependentRequired !== void 0) {
                vHeader |= OBJ_DEP_REQUIRED;
                let triggers = Object.keys(opts.dependentRequired);
                payloads.push(triggers.length);
                for (let i = 0; i < triggers.length; i++) {
                    let triggerKeyId = lookup(triggers[i]);
                    let deps = opts.dependentRequired[triggers[i]];
                    payloads.push(triggerKeyId);
                    payloads.push(deps.length);
                    for (let j = 0; j < deps.length; j++) {
                        payloads.push(lookup(deps[j]));
                    }
                }
            }
            if (opts.additionalProperties === false) {
                vHeader |= OBJ_NO_ADDITIONAL;
            }
            valIdx = allocValidator(vHeader, payloads, volatile);
        }
        let id = registerObject(resolved, count, volatile);
        let kindHeader = hasValidator ? (K_OBJECT | HAS_VALIDATOR) : K_OBJECT;
        let slots = hasValidator ? 3 : 2;
        let kindPtr = allocKind(kindHeader, id, volatile, slots);
        if (hasValidator) {
            let kinds = volatile ? V_KINDS : KINDS;
            kinds[kindPtr + 2] = valIdx;
        }
        //@ts-ignore
        return (COMPLEX | (volatile ? VOLATILE : 0) | kindPtr) >>> 0;
    }

    /**
     * @throws
     * @template T
     * @param {number} elemType
     * @param {boolean} volatile
     * @param {uvd.cat.ArrayValidators=} opts
     * @returns {uvd.cat.Complex<uvd.cat.InferSchema<T>, R>}
     */
    function arrayImpl(elemType, volatile, opts) {
        assertIsNumber(elemType, ERR_ARRAY_ELEMENT_MUST_BE_NUMBER);
        const hasVal = opts !== void 0;
        let valIdx = 0;
        if (hasVal) {
            let vHeader = 0;
            /** @type {!Array<number>} */
            let payloads = [];
            if (opts.minItems !== void 0) {
                vHeader |= ARR_MIN_ITEMS;
                payloads.push(opts.minItems);
            }
            if (opts.maxItems !== void 0) {
                vHeader |= ARR_MAX_ITEMS;
                payloads.push(opts.maxItems);
            }
            if (opts.uniqueItems) {
                vHeader |= ARR_UNIQUE;
            }
            if (opts.contains !== void 0) {
                vHeader |= ARR_CONTAINS;
                payloads.push(opts.contains >>> 0);
            }
            if (opts.minContains !== void 0) {
                vHeader |= ARR_MIN_CONTAINS;
                payloads.push(opts.minContains);
            }
            if (opts.maxContains !== void 0) {
                vHeader |= ARR_MAX_CONTAINS;
                payloads.push(opts.maxContains);
            }
            valIdx = allocValidator(vHeader, payloads, volatile);
        }
        let index = registerArray(elemType, volatile);
        let kindHeader = hasVal ? (K_ARRAY | HAS_VALIDATOR) : K_ARRAY;
        let slots = hasVal ? 3 : 2;
        let kindPtr = allocKind(kindHeader, index, volatile, slots);
        if (hasVal) {
            let kinds = volatile ? V_KINDS : KINDS;
            kinds[kindPtr + 2] = valIdx;
        }
        //@ts-ignore
        return (COMPLEX | (volatile ? VOLATILE : 0) | kindPtr) >>> 0;
    }

    /**
     * @throws
     * @template T
     * @template {string} D
     * @param {D} discriminator
     * @param {!Record<string,number>} variants
     * @param {boolean} volatile
     * @returns {uvd.cat.Complex<{ [K in keyof T]: uvd.cat.Infer<T[K]> & { [P in D]: K } }[keyof T], R>}
     */
    function unionImpl(discriminator, variants, volatile) {
        if (
            variants === null ||
            typeof variants !== 'object' ||
            Object.prototype.toString.call(variants) !== '[object Object]'
        ) {
            throw new Error('discriminated variants must be an object literal { key: type }');
        }
        if (typeof discriminator !== 'string') {
            throw new Error('discriminated discriminator must be a string');
        }
        let keys = Object.keys(variants);
        let count = keys.length;
        let required = count * 2;

        // Resolve variant [keyId, type] pairs
        /** @type {!Array<number>} */
        let resolved = new Array(required);
        for (let i = 0; i < count; i++) {
            let type = variants[keys[i]];
            if (typeof type !== 'number') {
                throw new Error('Invalid variant type for key ' + keys[i]);
            }
            resolved[i * 2] = lookup(keys[i]);
            resolved[i * 2 + 1] = type >>> 0;
        }

        let discKeyId = lookup(discriminator);
        let id = registerUnion(resolved, count, discKeyId, volatile);
        let kindId = allocKind(K_UNION, id, volatile, 2);
        //@ts-ignore
        return (COMPLEX | (volatile ? VOLATILE : 0) | kindId) >>> 0;
    }

    /**
     * @param {*} holder
     * @param {string|number} slot
     * @param {number} type
     * @param {boolean} reify
     * @returns {boolean}
     */
    function _parseSlot(holder, slot, type, reify) {
        let data = holder[slot];
        if (data == null) {
            return (data === null ? (type & NULLABLE) : (type & OPTIONAL)) !== 0;
        }
        if (type & COMPLEX) {
            return _conform(data, type, reify);
        }
        let vm = type & PRIM_MASK;
        if (vm !== 0) {
            let result = parseValue(data, vm, reify);
            if (result === FAIL) return false;
            holder[slot] = result;
            return true;
        }
        return false;
    }

    /**
     * @param {*} data
     * @param {number} typedef
     * @param {number} strict
     * @returns {boolean}
     */
    function _is(data, typedef, strict) {
        if (data == null) {
            return (data === null ? (typedef & NULLABLE) : (typedef & OPTIONAL)) !== 0;
        }
        if (typedef & COMPLEX) {
            let volatile = (typedef & VOLATILE) !== 0;
            let ptr = typedef & KIND_MASK;
            let kinds = volatile ? V_KINDS : KINDS;
            let header = kinds[ptr];
            let ct = header & KIND_ENUM_MASK;
            let ri = kinds[ptr + 1];
            if (ct === K_PRIMITIVE) {
                return _isValue(data, header & PRIMITIVE);
            }
            if (ct === K_ARRAY) {
                if (!Array.isArray(data)) {
                    return false;
                }
                let arrays = volatile ? V_ARRAYS : ARRAYS;
                let length = data.length;
                let innerType = arrays[ri];
                for (let i = 0; i < length; i++) {
                    let item = data[i];
                    if (item == null) {
                        if ((item === null ? (innerType & NULLABLE) : (innerType & OPTIONAL)) === 0) {
                            return false;
                        }
                        continue;
                    }
                    if (innerType & COMPLEX) {
                        if (!_is(item, innerType, strict)) {
                            return false;
                        }
                        continue;
                    }
                    if (innerType & PRIMITIVE) {
                        if (!_isValue(item, innerType & PRIM_MASK)) {
                            return false;
                        }
                        continue;
                    }
                    return false;
                }
                return true;
            }
            if (ct === K_OBJECT) {
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    return false;
                }
                let objects = volatile ? V_OBJECTS : OBJECTS;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = objects[ri * 2];
                let length = objects[ri * 2 + 1];
                for (let i = 0; i < length; i++) {
                    let key = KEY_INDEX.get(slab[offset + (i * 2)]);
                    if (key === void 0) {
                        return false;
                    }
                    let type = slab[offset + (i * 2) + 1];
                    let item = data[key];
                    if (item == null) {
                        if ((item === null ? (type & NULLABLE) : (type & OPTIONAL)) === 0) {
                            return false;
                        }
                        continue;
                    }
                    if (type & COMPLEX) {
                        if (!_is(item, type, strict)) {
                            return false;
                        }
                        continue;
                    }
                    if (type & PRIMITIVE) {
                        if (!_isValue(item, type & PRIM_MASK)) {
                            return false;
                        }
                        continue;
                    }
                    return false;
                }
                if (strict !== NOT_STRICT) {
                    let reject = (strict & STRICT_REJECT) !== 0;
                    let proto = (strict & STRICT_PROTO) !== 0;
                    for (let key in data) {
                        if (proto && !hasOwnProperty.call(data, key)) {
                            continue;
                        }
                        let keyId = KEY_DICT.get(key);
                        if (keyId === void 0) {
                            // If we don't even know the key, it cannot possibly be optional
                            if (reject) {
                                return false;
                            }
                            delete data[key];
                            continue;
                        }
                        let lo = 0;
                        let hi = length - 1;
                        let missing = true;

                        while (lo <= hi) {
                            let mid = (lo + hi) >>> 1;
                            let slot = offset + (mid << 1);
                            let midKey = slab[slot];

                            if (midKey === keyId) {
                                missing = false;
                                break;
                            } else if (midKey < keyId) {
                                lo = mid + 1;
                            } else {
                                hi = mid - 1;
                            }
                        }
                        if (missing) {
                            if (reject) return false;
                            delete data[key];
                        }
                    }
                }
                return true;
            }
            if (ct === K_UNION) {
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    return false;
                }
                let unions = volatile ? V_UNIONS : UNIONS;
                let slab = volatile ? V_SLAB : SLAB;
                let discKey = KEY_INDEX.get(unions[ri * 3 + 2]);
                if (discKey === void 0) {
                    return false;
                }
                let valueId = KEY_DICT.get(data[discKey]);
                if (valueId === void 0) {
                    return false;
                }
                let offset = unions[ri * 3];
                let length = unions[ri * 3 + 1];
                for (let i = 0; i < length; i++) {
                    if (slab[offset + i * 2] === valueId) {
                        return _is(data, slab[offset + i * 2 + 1], strict);
                    }
                }
                return false;
            }
            if (ct === K_REFINE) {
                return _is(data, ri, strict);
            }
            if (ct === K_TUPLE) {
                if (!Array.isArray(data)) {
                    return false;
                }
                let tuples = volatile ? V_TUPLES : TUPLES;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = tuples[ri * 2];
                let length = tuples[ri * 2 + 1];
                if (data.length !== length) {
                    return false;
                }
                for (let i = 0; i < length; i++) {
                    let elemType = slab[offset + i];
                    let item = data[i];
                    if (item == null) {
                        if ((item === null ? (elemType & NULLABLE) : (elemType & OPTIONAL)) === 0) {
                            return false;
                        }
                        continue;
                    }
                    if (elemType & COMPLEX) {
                        if (!_is(item, elemType, strict)) {
                            return false;
                        }
                        continue;
                    }
                    if (elemType & PRIMITIVE) {
                        if (!_isValue(item, elemType & PRIM_MASK)) {
                            return false;
                        }
                        continue;
                    }
                    return false;
                }
                return true;
            }
            if (ct === K_RECORD) {
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    return false;
                }
                let valueType = ri;
                let dataKeys = Object.keys(data);
                for (let i = 0; i < dataKeys.length; i++) {
                    let item = data[dataKeys[i]];
                    if (item == null) {
                        if ((item === null ? (valueType & NULLABLE) : (valueType & OPTIONAL)) === 0) {
                            return false;
                        }
                        continue;
                    }
                    if (valueType & COMPLEX) {
                        if (!_is(item, valueType, strict)) {
                            return false;
                        }
                        continue;
                    }
                    if (valueType & PRIMITIVE) {
                        if (!_isValue(item, valueType & PRIM_MASK)) {
                            return false;
                        }
                        continue;
                    }
                    return false;
                }
                return true;
            }
            if (ct === K_OR) {
                let matches = volatile ? V_MATCHES : MATCHES;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = matches[ri * 2];
                let count = matches[ri * 2 + 1];
                for (let i = 0; i < count; i++) {
                    if (_is(data, slab[offset + i], strict)) {
                        return true;
                    }
                }
                return false;
            }
            if (ct === K_EXCLUSIVE) {
                let matches = volatile ? V_MATCHES : MATCHES;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = matches[ri * 2];
                let count = matches[ri * 2 + 1];
                let matchCount = 0;
                for (let i = 0; i < count; i++) {
                    if (_is(data, slab[offset + i], strict)) {
                        matchCount++;
                        if (matchCount > 1) {
                            return false;
                        }
                    }
                }
                return matchCount === 1;
            }
            if (ct === K_INTERSECT) {
                let matches = volatile ? V_MATCHES : MATCHES;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = matches[ri * 2];
                let count = matches[ri * 2 + 1];
                for (let i = 0; i < count; i++) {
                    if (!_is(data, slab[offset + i], strict)) {
                        return false;
                    }
                }
                return true;
            }
            if (ct === K_NOT) {
                return !_is(data, ri, strict);
            }
            if (ct === K_CONDITIONAL) {
                let matches = volatile ? V_MATCHES : MATCHES;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = matches[ri * 2];
                let ifType = slab[offset];
                let thenType = slab[offset + 1];
                let elseType = slab[offset + 2];
                if (_is(data, ifType, strict)) {
                    return thenType === 0 ? true : _is(data, thenType, strict);
                } else {
                    return elseType === 0 ? true : _is(data, elseType, strict);
                }
            }
            return false;
        }
        let valueMask = typedef & PRIM_MASK;
        if (valueMask === 0) {
            return false;
        }
        return _isValue(data, valueMask);
    }

    /**
     * @throws
     * @param {*} data
     * @param {number} typedef
     * @param {number=} strict
     * @returns {void}
     */
    function guard(data, typedef, strict) {
        if (!is(data, typedef, strict)) {
            throw diagnose(data, typedef);
        }
    }

    /**
     * @param {*} data
     * @param {number} typedef
     * @param {boolean=} preserve
     * @returns {boolean}
     */
    function conform(data, typedef, preserve) {
        rewindPending = true;
        let result = _conform(data, typedef, !preserve);
        return result;
    }

    /**
     * @param {*} data
     * @param {number} typedef
     * @param {boolean} reify
     * @returns {boolean}
     */
    function _conform(data, typedef, reify) {
        if (data == null) {
            return (data === null ? (typedef & NULLABLE) : (typedef & OPTIONAL)) !== 0;
        }
        if (typedef & COMPLEX) {
            let volatile = (typedef & VOLATILE) !== 0;
            let ptr = typedef & KIND_MASK;
            let kinds = volatile ? V_KINDS : KINDS;
            let header = kinds[ptr];
            let ct = header & KIND_ENUM_MASK;
            let ri = kinds[ptr + 1];
            if (ct === K_PRIMITIVE) {
                let vm = header & PRIMITIVE;
                return vm !== 0 && parseValue(data, vm, reify) !== FAIL;
            }
            if (ct === K_ARRAY) {
                if (!Array.isArray(data)) {
                    return false;
                }
                let arrays = volatile ? V_ARRAYS : ARRAYS;
                let elemType = arrays[ri];
                let length = data.length;
                for (let i = 0; i < length; i++) {
                    if (!_parseSlot(data, i, elemType, reify)) {
                        return false;
                    }
                }
                return true;
            }
            if (ct === K_OBJECT) {
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    return false;
                }
                let objects = volatile ? V_OBJECTS : OBJECTS;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = objects[ri * 2];
                let length = objects[ri * 2 + 1];
                for (let i = 0; i < length; i++) {
                    let key = KEY_INDEX.get(slab[offset + (i * 2)]);
                    if (key === void 0) {
                        return false;
                    }
                    let type = slab[offset + (i * 2) + 1];
                    if (!_parseSlot(data, key, type, reify)) {
                        return false;
                    }
                }
                return true;
            }
            if (ct === K_UNION) {
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    return false;
                }
                let unions = volatile ? V_UNIONS : UNIONS;
                let slab = volatile ? V_SLAB : SLAB;
                let discKey = KEY_INDEX.get(unions[ri * 3 + 2]);
                if (discKey === void 0) {
                    return false;
                }
                let valueId = KEY_DICT.get(data[discKey]);
                if (valueId === void 0) {
                    return false;
                }
                let offset = unions[ri * 3];
                let length = unions[ri * 3 + 1];
                for (let i = 0; i < length; i++) {
                    if (slab[offset + i * 2] === valueId) {
                        return _conform(data, slab[offset + i * 2 + 1], reify);
                    }
                }
                return false;
            }
            if (ct === K_REFINE) {
                return _conform(data, ri, reify);
            }
            if (ct === K_TUPLE) {
                if (!Array.isArray(data)) {
                    return false;
                }
                let tuples = volatile ? V_TUPLES : TUPLES;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = tuples[ri * 2];
                let length = tuples[ri * 2 + 1];
                if (data.length !== length) {
                    return false;
                }
                for (let i = 0; i < length; i++) {
                    if (!_parseSlot(data, i, slab[offset + i], reify)) {
                        return false;
                    }
                }
                return true;
            }
            if (ct === K_RECORD) {
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    return false;
                }
                let valueType = ri;
                let dataKeys = Object.keys(data);
                for (let i = 0; i < dataKeys.length; i++) {
                    if (!_parseSlot(data, dataKeys[i], valueType, reify)) {
                        return false;
                    }
                }
                return true;
            }
            if (ct === K_OR) {
                let matches = volatile ? V_MATCHES : MATCHES;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = matches[ri * 2];
                let count = matches[ri * 2 + 1];
                for (let i = 0; i < count; i++) {
                    if (_conform(data, slab[offset + i], reify)) {
                        return true;
                    }
                }
                return false;
            }
            if (ct === K_EXCLUSIVE) {
                let matches = volatile ? V_MATCHES : MATCHES;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = matches[ri * 2];
                let count = matches[ri * 2 + 1];
                let matchCount = 0;
                for (let i = 0; i < count; i++) {
                    if (_conform(data, slab[offset + i], reify)) {
                        matchCount++;
                        if (matchCount > 1) {
                            return false;
                        }
                    }
                }
                return matchCount === 1;
            }
            if (ct === K_INTERSECT) {
                let matches = volatile ? V_MATCHES : MATCHES;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = matches[ri * 2];
                let count = matches[ri * 2 + 1];
                for (let i = 0; i < count; i++) {
                    if (!_conform(data, slab[offset + i], reify)) {
                        return false;
                    }
                }
                return true;
            }
            if (ct === K_NOT) {
                return !_conform(data, ri, reify);
            }
            if (ct === K_CONDITIONAL) {
                let matches = volatile ? V_MATCHES : MATCHES;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = matches[ri * 2];
                let ifType = slab[offset];
                let thenType = slab[offset + 1];
                let elseType = slab[offset + 2];
                if (_conform(data, ifType, reify)) {
                    return thenType === 0 ? true : _conform(data, thenType, reify);
                } else {
                    return elseType === 0 ? true : _conform(data, elseType, reify);
                }
            }
            return false;
        }
        let valueMask = typedef & PRIM_MASK;
        if (valueMask === 0) {
            return false;
        }
        return parseValue(data, valueMask, reify) !== FAIL;
    }

    /**
     * @param {*} data
     * @param {number} typedef
     * @returns {!Array<uvd.cat.PathError>}
     */
    function diagnose(data, typedef) {
        rewindPending = true;
        /** @type {!Array<uvd.cat.PathError>} */
        let errors = [];
        _diagnose(data, typedef, '', errors);
        return errors;
    }

    /**
     * @param {*} data
     * @param {number} typedef
     * @param {string} path
     * @param {!Array<uvd.cat.PathError>} errors
     * @returns {void}
     */
    function _diagnose(data, typedef, path, errors) {
        const kinds = (typedef & VOLATILE) === 0 ? KINDS : V_KINDS;
        if (data === void 0) {
            if (!(typedef & OPTIONAL)) {
                errors.push({ path, message: 'unexpected undefined, expected ' + describeType(typedef, kinds) });
            }
            return;
        }
        if (data === null) {
            if (!(typedef & NULLABLE)) {
                errors.push({ path, message: 'unexpected null, expected ' + describeType(typedef, kinds) });
            }
            return;
        }
        if (typedef & COMPLEX) {
            let volatile = (typedef & VOLATILE) !== 0;
            let ptr = typedef & KIND_MASK;
            let kinds = volatile ? V_KINDS : KINDS;
            let header = kinds[ptr];
            let ct = header & KIND_ENUM_MASK;
            let ri = kinds[ptr + 1];
            if (ct === K_PRIMITIVE) {
                let primBits = header & PRIMITIVE;
                if (primBits === 0 || !_isValue(data, primBits)) {
                    /** @type {string} */
                    let type = typeof data;
                    if (type === 'object') {
                        if (data instanceof Date) {
                            type = 'Date';
                        } else if (data instanceof URL) {
                            type = 'URL';
                        }
                    }
                    errors.push({ path, message: 'expected ' + describeType(typedef, kinds) + ', got ' + type });
                }
                return;
            }
            if (ct === K_ARRAY) {
                if (!Array.isArray(data)) {
                    errors.push({ path, message: 'expected array, got ' + typeof data });
                    return;
                }
                let arrays = volatile ? V_ARRAYS : ARRAYS;
                let itemType = arrays[ri];
                let length = data.length;
                for (let i = 0; i < length; i++) {
                    _diagnose(data[i], itemType, path + '[' + i + ']', errors);
                }
                return;
            }
            if (ct === K_UNION) {
                let unions = volatile ? V_UNIONS : UNIONS;
                let slab = volatile ? V_SLAB : SLAB;
                let discKey = KEY_INDEX.get(unions[ri * 3 + 2]);
                if (discKey === void 0) {
                    errors.push({ path, message: '!! CRITICAL ERROR !! Please file an issue at Github !!' });
                    return;
                }
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    errors.push({ path, message: 'expected object for discriminated union, got ' + typeof data });
                    return;
                }
                if (!(discKey in data)) {
                    errors.push({ path, message: 'missing discriminator key "' + discKey + '"' });
                    return;
                }
                let valueId = KEY_DICT.get(data[discKey]);
                let offset = unions[ri * 3];
                let length = unions[ri * 3 + 1];
                for (let i = 0; i < length; i++) {
                    if (slab[offset + i * 2] === valueId) {
                        _diagnose(data, slab[offset + i * 2 + 1], path, errors);
                        return;
                    }
                }
                errors.push({ path: path + (path ? '.' : '') + discKey, message: 'unknown discriminator value "' + data[discKey] + '"' });
                return;
            }
            if (ct === K_OBJECT) {
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    errors.push({ path, message: 'expected object, got ' + typeof data });
                    return;
                }
                let objects = volatile ? V_OBJECTS : OBJECTS;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = objects[ri * 2];
                let length = objects[ri * 2 + 1];
                for (let i = 0; i < length; i++) {
                    let key = KEY_INDEX.get(slab[offset + (i * 2)]);
                    if (key === void 0) {
                        errors.push({ path, message: '!! CRITICAL ERROR !! Please file an issue at Github !!' });
                        return;
                    }
                    let type = slab[offset + (i * 2) + 1];
                    let fieldPath = path + (path ? '.' : '') + key;
                    _diagnose(data[key], type, fieldPath, errors);
                }
                return;
            }
            if (ct === K_REFINE) {
                _diagnose(data, ri, path, errors);
                return;
            }
            if (ct === K_TUPLE) {
                if (!Array.isArray(data)) {
                    errors.push({ path, message: 'expected tuple, got ' + typeof data });
                    return;
                }
                let tuples = volatile ? V_TUPLES : TUPLES;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = tuples[ri * 2];
                let length = tuples[ri * 2 + 1];
                if (data.length !== length) {
                    errors.push({ path, message: 'expected tuple of length ' + length + ', got length ' + data.length });
                    return;
                }
                for (let i = 0; i < length; i++) {
                    _diagnose(data[i], slab[offset + i], path + '[' + i + ']', errors);
                }
                return;
            }
            if (ct === K_RECORD) {
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    errors.push({ path, message: 'expected object (record), got ' + typeof data });
                    return;
                }
                let valueType = ri;
                let dataKeys = Object.keys(data);
                for (let i = 0; i < dataKeys.length; i++) {
                    _diagnose(data[dataKeys[i]], valueType, path + (path ? '.' : '') + dataKeys[i], errors);
                }
                return;
            }
            if (ct === K_OR) {
                let matches = volatile ? V_MATCHES : MATCHES;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = matches[ri * 2];
                let count = matches[ri * 2 + 1];
                for (let i = 0; i < count; i++) {
                    if (_is(data, slab[offset + i], NOT_STRICT)) {
                        return;
                    }
                }
                errors.push({ path, message: 'value did not match any of the expected types' });
                return;
            }
            if (ct === K_EXCLUSIVE) {
                let matches = volatile ? V_MATCHES : MATCHES;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = matches[ri * 2];
                let count = matches[ri * 2 + 1];
                let matchCount = 0;
                for (let i = 0; i < count; i++) {
                    if (_is(data, slab[offset + i], NOT_STRICT)) {
                        matchCount++;
                    }
                }
                if (matchCount === 0) {
                    errors.push({ path, message: 'value did not match any of the exclusive types' });
                } else if (matchCount > 1) {
                    errors.push({ path, message: 'value matched ' + matchCount + ' types, expected exactly 1' });
                }
                return;
            }
            if (ct === K_INTERSECT) {
                let matches = volatile ? V_MATCHES : MATCHES;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = matches[ri * 2];
                let count = matches[ri * 2 + 1];
                for (let i = 0; i < count; i++) {
                    if (!_is(data, slab[offset + i], NOT_STRICT)) {
                        _diagnose(data, slab[offset + i], path, errors);
                    }
                }
                return;
            }
            if (ct === K_NOT) {
                if (_is(data, ri, NOT_STRICT)) {
                    errors.push({ path, message: 'value should NOT match the given type' });
                }
                return;
            }
            if (ct === K_CONDITIONAL) {
                let matches = volatile ? V_MATCHES : MATCHES;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = matches[ri * 2];
                let ifType = slab[offset];
                let thenType = slab[offset + 1];
                let elseType = slab[offset + 2];
                if (_is(data, ifType, NOT_STRICT)) {
                    if (thenType !== 0) {
                        _diagnose(data, thenType, path, errors);
                    }
                } else {
                    if (elseType !== 0) {
                        _diagnose(data, elseType, path, errors);
                    }
                }
                return;
            }
            errors.push({ path, message: 'invalid type definition (unknown complex kind)' });
            return;
        }
        let valueMask = typedef & PRIM_MASK;
        if (valueMask === 0) {
            errors.push({ path, message: 'invalid type definition (no type bits set)' });
            return;
        }
        if (!_isValue(data, valueMask)) {
            /** @type {string} */
            let type = typeof data;
            if (type === 'object') {
                if (data instanceof Date) {
                    type = 'Date';
                } else if (data instanceof URL) {
                    type = 'URL';
                }
            }
            errors.push({ path, message: 'expected ' + describeType(typedef, kinds) + ', got ' + type });
        }
    }

    /**
     * @param {*} data
     * @param {number} typedef
     * @param {number=} strict
     * @returns {boolean}
     */
    function is(data, typedef, strict) {
        rewindPending = true;
        let _strict = NOT_STRICT;
        if (typeof strict === 'number') {
            let mode = strict & STRICT_MODE_MASK;
            if (mode === STRICT_DELETE) {
                _strict |= STRICT_DELETE;
            } else if (mode === STRICT_REJECT) {
                _strict |= STRICT_REJECT;
            }
            if (strict & STRICT_PROTO) {
                _strict |= STRICT_PROTO;
            }
        }
        let result = _is(data, typedef, _strict);
        return result;
    }

    // --- VALIDATOR RUNNERS ---

    /**
     * @param {*} value
     * @param {number} primBits
     * @param {number} valIdx
     * @param {boolean} volatile
     * @returns {boolean}
     */
    function runPrimValidator(value, primBits, valIdx, volatile) {
        let vals = volatile ? V_VALIDATORS : VALIDATORS;
        let vHeader = vals[valIdx] | 0;
        let p = valIdx + 1;
        if (primBits & STRING) {
            if (vHeader & STR_MIN_LENGTH) {
                if ((/** @type {string} */(value)).length < vals[p++]) {
                    return false;
                }
            }
            if (vHeader & STR_MAX_LENGTH) {
                if ((/** @type {string} */(value)).length > vals[p++]) {
                    return false;
                }
            }
            if (vHeader & STR_PATTERN) {
                let regexCache = volatile ? V_REGEX_CACHE : REGEX_CACHE;
                if (!regexCache[vals[p++] | 0].test(/** @type {string} */(value))) {
                    return false;
                }
            }
            if (vHeader & STR_FORMAT) {
                let fmt = vals[p++] | 0;
                let re = fmt === FMT_EMAIL ? FMT_RE_EMAIL :
                    fmt === FMT_IPV4 ? FMT_RE_IPV4 :
                        fmt === FMT_UUID ? FMT_RE_UUID :
                            fmt === FMT_DATETIME ? FMT_RE_DATETIME : null;
                if (re && !re.test(/** @type {string} */(value))) {
                    return false;
                }
            }
            return true;
        }
        if (primBits & (NUMBER | INTEGER)) {
            if (vHeader & NUM_MINIMUM) {
                if (/** @type {number} */(value) < vals[p++]) {
                    return false;
                }
            }
            if (vHeader & NUM_MAXIMUM) {
                if (/** @type {number} */(value) > vals[p++]) {
                    return false;
                }
            }
            if (vHeader & NUM_EX_MIN) {
                if (/** @type {number} */(value) <= vals[p++]) {
                    return false;
                }
            }
            if (vHeader & NUM_EX_MAX) {
                if (/** @type {number} */(value) >= vals[p++]) {
                    return false;
                }
            }
            if (vHeader & NUM_MULTIPLE_OF) {
                if (/** @type {number} */(value) % vals[p++] !== 0) {
                    return false;
                }
            }
            return true;
        }
        return true;
    }

    /**
     * @param {!Array<*>} data
     * @param {number} valIdx
     * @param {boolean} volatile
     * @returns {boolean}
     */
    function runArrayValidator(data, valIdx, volatile) {
        let vals = volatile ? V_VALIDATORS : VALIDATORS;
        let vHeader = vals[valIdx] | 0;
        let p = valIdx + 1;
        if (vHeader & ARR_MIN_ITEMS) {
            if (data.length < vals[p++]) {
                return false;
            }
        }
        if (vHeader & ARR_MAX_ITEMS) {
            if (data.length > vals[p++]) {
                return false;
            }
        }
        if (vHeader & ARR_UNIQUE) {
            let set = new Set(data);
            if (set.size !== data.length) {
                return false;
            }
        }
        if (vHeader & ARR_CONTAINS) {
            let containsType = vals[p++] >>> 0;
            let minC = (vHeader & ARR_MIN_CONTAINS) ? vals[p++] : 1;
            let maxC = (vHeader & ARR_MAX_CONTAINS) ? vals[p++] : Infinity;
            let matchCount = 0;
            let length = data.length;
            for (let i = 0; i < length; i++) {
                if (_validate(data[i], containsType)) {
                    matchCount++;
                    if (matchCount > maxC) {
                        return false;
                    }
                }
            }
            if (matchCount < minC) {
                return false;
            }
        } else {
            // Skip minContains/maxContains payloads if no contains
            if (vHeader & ARR_MIN_CONTAINS) {
                p++;
            }
            if (vHeader & ARR_MAX_CONTAINS) {
                p++;
            }
        }
        return true;
    }

    /**
     * @param {!Record<string,any>} data
     * @param {number} valIdx
     * @param {boolean} volatile
     * @param {number} ri
     * @returns {boolean}
     */
    function runObjectValidator(data, valIdx, volatile, ri) {
        let vals = volatile ? V_VALIDATORS : VALIDATORS;
        let regexCache = volatile ? V_REGEX_CACHE : REGEX_CACHE;
        let vHeader = vals[valIdx] | 0;
        let p = valIdx + 1;
        let keys = Object.keys(data);
        let keyCount = keys.length;
        if (vHeader & OBJ_MIN_PROPS) {
            if (keyCount < vals[p++]) {
                return false;
            }
        }
        if (vHeader & OBJ_MAX_PROPS) {
            if (keyCount > vals[p++]) {
                return false;
            }
        }
        if (vHeader & OBJ_PATTERN_PROPS) {
            // patternProperties: count, then [regexIdx, typeId] pairs
            let patternCount = vals[p++] | 0;
            for (let pi = 0; pi < patternCount; pi++) {
                let reIdx = vals[p++] | 0;
                let schemaType = vals[p++] >>> 0;
                let re = regexCache[reIdx];
                for (let ki = 0; ki < keyCount; ki++) {
                    if (re.test(keys[ki])) {
                        if (!_validate(data[keys[ki]], schemaType)) {
                            return false;
                        }
                    }
                }
            }
        }
        if (vHeader & OBJ_PROP_NAMES) {
            // propertyNames: typeId of a string schema
            let nameSchema = vals[p++] >>> 0;
            for (let ki = 0; ki < keyCount; ki++) {
                if (!_validate(keys[ki], nameSchema)) {
                    return false;
                }
            }
        }
        if (vHeader & OBJ_DEP_REQUIRED) {
            // dependentRequired: triggerCount, then [triggerKeyId, depCount, ...depKeyIds]
            let triggerCount = vals[p++] | 0;
            for (let ti = 0; ti < triggerCount; ti++) {
                let triggerKeyId = vals[p++] | 0;
                let depCount = vals[p++] | 0;
                let triggerKey = KEY_INDEX.get(triggerKeyId);
                if (triggerKey !== void 0 && data[triggerKey] !== void 0) {
                    for (let di = 0; di < depCount; di++) {
                        let depKeyId = vals[p++] | 0;
                        let depKey = KEY_INDEX.get(depKeyId);
                        if (depKey === void 0 || data[depKey] === void 0) {
                            return false;
                        }
                    }
                } else {
                    p += depCount;
                }
            }
        }
        if (vHeader & OBJ_NO_ADDITIONAL) {
            let objects = volatile ? V_OBJECTS : OBJECTS;
            let slab = volatile ? V_SLAB : SLAB;
            let offset = objects[ri * 2];
            let length = objects[ri * 2 + 1];
            for (let ki = 0; ki < keyCount; ki++) {
                let keyId = KEY_DICT.get(keys[ki]);
                if (keyId === void 0) {
                    return false;
                }
                let lo = 0;
                let hi = length - 1;
                let missing = true;
                while (lo <= hi) {
                    let mid = (lo + hi) >>> 1;
                    let sk = slab[offset + (mid << 1)];
                    if (sk === keyId) {
                        missing = false;
                        break;
                    }
                    if (sk < keyId) {
                        lo = mid + 1;
                    } else {
                        hi = mid - 1;
                    }
                }
                if (missing) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * @param {*} raw
     * @param {number} type
     * @returns {boolean}
     */
    function _validateSlot(raw, type) {
        return (
            raw === void 0 ? (type & OPTIONAL) !== 0 :
                raw === null ? (type & NULLABLE) !== 0 :
                    (type & COMPLEX) ? _validate(raw, type) :
                        (type & PRIMITIVE) ? _isValue(raw, type & PRIM_MASK) :
                            false
        );
    }

    /**
     * @param {*} data
     * @param {number} typedef
     * @returns {boolean}
     */
    function _validate(data, typedef) {
        if (data == null) {
            return (data === null ? (typedef & NULLABLE) : (typedef & OPTIONAL)) !== 0;
        }
        if (typedef & COMPLEX) {
            let volatile = (typedef & VOLATILE) !== 0;
            let ptr = typedef & KIND_MASK;
            let kinds = volatile ? V_KINDS : KINDS;
            let header = kinds[ptr];
            let ct = header & KIND_ENUM_MASK;
            let ri = kinds[ptr + 1];
            if (ct === K_PRIMITIVE) {
                let primBits = header & PRIMITIVE;
                if (!_isValue(data, primBits)) {
                    return false;
                }
                if (header & HAS_VALIDATOR) {
                    return runPrimValidator(data, primBits, ri, volatile);
                }
                return true;
            }
            if (ct === K_ARRAY) {
                if (!Array.isArray(data)) return false;
                let arrays = volatile ? V_ARRAYS : ARRAYS;
                let innerType = arrays[ri];
                let length = data.length;
                for (let i = 0; i < length; i++) {
                    if (!_validateSlot(data[i], innerType)) return false;
                }
                if (header & HAS_VALIDATOR) {
                    return runArrayValidator(data, kinds[ptr + 2], volatile);
                }
                return true;
            }
            if (ct === K_UNION) {
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    return false;
                }
                let unions = volatile ? V_UNIONS : UNIONS;
                let slab = volatile ? V_SLAB : SLAB;
                let discKey = KEY_INDEX.get(unions[ri * 3 + 2]);
                if (discKey === void 0) {
                    return false;
                }
                let valueId = KEY_DICT.get(data[discKey]);
                let offset = unions[ri * 3];
                let length = unions[ri * 3 + 1];
                for (let i = 0; i < length; i++) {
                    if (slab[offset + i * 2] === valueId) {
                        return _validate(data, slab[offset + i * 2 + 1]);
                    }
                }
                return false;
            }
            if (ct === K_OBJECT) {
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    return false;
                }
                let objects = volatile ? V_OBJECTS : OBJECTS;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = objects[ri * 2];
                let length = objects[ri * 2 + 1];
                for (let i = 0; i < length; i++) {
                    let key = KEY_INDEX.get(slab[offset + (i * 2)]);
                    if (key === void 0) {
                        return false;
                    }
                    let type = slab[offset + (i * 2) + 1];
                    if (!_validateSlot(data[key], type)) {
                        return false;
                    }
                }
                if (header & HAS_VALIDATOR) {
                    return runObjectValidator(data, kinds[ptr + 2], volatile, ri);
                }
                return true;
            }
            if (ct === K_REFINE) {
                if (!_validate(data, ri)) {
                    return false;
                }
                let callbacks = volatile ? V_CALLBACKS : CALLBACKS;
                return !!callbacks[kinds[ptr + 2]](data);
            }
            if (ct === K_TUPLE) {
                if (!Array.isArray(data)) {
                    return false;
                }
                let tuples = volatile ? V_TUPLES : TUPLES;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = tuples[ri * 2];
                let length = tuples[ri * 2 + 1];
                if (data.length !== length) {
                    return false;
                }
                for (let i = 0; i < length; i++) {
                    if (!_validateSlot(data[i], slab[offset + i])) {
                        return false;
                    }
                }
                return true;
            }
            if (ct === K_RECORD) {
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    return false;
                }
                let valueType = ri;
                let dataKeys = Object.keys(data);
                for (let i = 0; i < dataKeys.length; i++) {
                    if (!_validateSlot(data[dataKeys[i]], valueType)) {
                        return false;
                    }
                }
                return true;
            }
            if (ct === K_OR) {
                let matches = volatile ? V_MATCHES : MATCHES;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = matches[ri * 2];
                let count = matches[ri * 2 + 1];
                for (let i = 0; i < count; i++) {
                    if (_validate(data, slab[offset + i])) {
                        return true;
                    }
                }
                return false;
            }
            if (ct === K_EXCLUSIVE) {
                let matches = volatile ? V_MATCHES : MATCHES;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = matches[ri * 2];
                let count = matches[ri * 2 + 1];
                let matchCount = 0;
                for (let i = 0; i < count; i++) {
                    if (_validate(data, slab[offset + i])) {
                        matchCount++;
                        if (matchCount > 1) {
                            return false;
                        }
                    }
                }
                return matchCount === 1;
            }
            if (ct === K_INTERSECT) {
                let matches = volatile ? V_MATCHES : MATCHES;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = matches[ri * 2];
                let count = matches[ri * 2 + 1];
                for (let i = 0; i < count; i++) {
                    if (!_validate(data, slab[offset + i])) {
                        return false;
                    }
                }
                return true;
            }
            if (ct === K_NOT) {
                return !_validate(data, ri);
            }
            if (ct === K_CONDITIONAL) {
                let matches = volatile ? V_MATCHES : MATCHES;
                let slab = volatile ? V_SLAB : SLAB;
                let offset = matches[ri * 2];
                let ifType = slab[offset];
                let thenType = slab[offset + 1];
                let elseType = slab[offset + 2];
                if (_validate(data, ifType)) {
                    return thenType === 0 ? true : _validate(data, thenType);
                } else {
                    return elseType === 0 ? true : _validate(data, elseType);
                }
            }
            return false;
        }
        let valueMask = typedef & PRIM_MASK;
        if (valueMask === 0) {
            return false;
        }
        return _isValue(data, valueMask);
    }

    /**
     * @param {*} data
     * @param {number} typedef
     * @returns {boolean}
     */
    function validate(data, typedef) {
        rewindPending = true;
        let result = _validate(data, typedef);
        return result;
    }

    /**
     * Writes pre-resolved [keyId, typedef, ...] pairs to SLAB, registers in OBJECTS.
     * @param {!Array<number>} resolved - sorted [keyId, typedef] pairs
     * @param {number} count - number of properties (resolved.length / 2)
     * @param {boolean} volatile
     * @returns {number} object registry id
     */
    function registerObject(resolved, count, volatile) {
        let required = count * 2;
        if (volatile) {
            if (VOL_HEAP.PTR + required > VOL_HEAP.SLAB_LEN) {
                let buffer = new Uint32Array(VOL_HEAP.SLAB_LEN *= 2);
                buffer.set(V_SLAB);
                VOL_HEAP.SLAB = V_SLAB = buffer;
            }
            let offset = VOL_HEAP.PTR;
            for (let i = 0; i < required; i++) {
                V_SLAB[offset + i] = resolved[i];
            }
            if ((VOL_HEAP.OBJ_COUNT + 1) * 2 > VOL_HEAP.OBJ_LEN) {
                let buffer = VOL_HEAP.OBJ_TYPE === U16 ?
                    new Uint16Array(VOL_HEAP.OBJ_LEN *= 2) :
                    new Uint32Array(VOL_HEAP.OBJ_LEN *= 2);
                buffer.set(V_OBJECTS);
                VOL_HEAP.OBJECTS = V_OBJECTS = buffer;
            }
            if (VOL_HEAP.OBJ_TYPE === U16 && VOL_HEAP.PTR + required > 65535) {
                let buffer = new Uint32Array(VOL_HEAP.OBJ_LEN);
                buffer.set(V_OBJECTS);
                VOL_HEAP.OBJECTS = V_OBJECTS = buffer;
                VOL_HEAP.OBJ_TYPE = U32;
            }
            let id = VOL_HEAP.OBJ_COUNT++;
            V_OBJECTS[id * 2] = offset;
            V_OBJECTS[id * 2 + 1] = count;
            VOL_HEAP.PTR += required;
            return id;
        }
        if (HEAP.PTR + required > HEAP.SLAB_LEN) {
            let buffer = new Uint32Array(HEAP.SLAB_LEN *= 2);
            buffer.set(SLAB);
            HEAP.SLAB = SLAB = buffer;
        }
        if (HEAP.OBJ_TYPE === U16 && HEAP.PTR + required > 65535) {
            let buffer = new Uint32Array(HEAP.OBJ_LEN);
            buffer.set(OBJECTS);
            HEAP.OBJECTS = OBJECTS = buffer;
            HEAP.OBJ_TYPE = U32;
        }
        let offset = HEAP.PTR;
        for (let i = 0; i < required; i++) {
            SLAB[offset + i] = resolved[i];
        }
        if ((HEAP.OBJ_COUNT + 1) * 2 > HEAP.OBJ_LEN) {
            let buffer = HEAP.OBJ_TYPE === U16 ?
                new Uint16Array(HEAP.OBJ_LEN *= 2) :
                new Uint32Array(HEAP.OBJ_LEN *= 2);
            buffer.set(OBJECTS);
            HEAP.OBJECTS = OBJECTS = buffer;
        }
        let id = HEAP.OBJ_COUNT++;
        OBJECTS[id * 2] = offset;
        OBJECTS[id * 2 + 1] = count;
        HEAP.PTR += required;
        return id;
    }

    /**
     * Registers an element type in ARRAYS.
     * @param {number} elemType
     * @param {boolean} volatile
     * @returns {number} array registry id
     */
    function registerArray(elemType, volatile) {
        if (volatile) {
            let index = VOL_HEAP.ARR_COUNT++;
            if (index >= VOL_HEAP.ARR_LEN) {
                let buffer = new Uint32Array(VOL_HEAP.ARR_LEN *= 2);
                buffer.set(V_ARRAYS);
                VOL_HEAP.ARRAYS = V_ARRAYS = buffer;
            }
            V_ARRAYS[index] = elemType >>> 0;
            return index;
        }
        let index = HEAP.ARR_COUNT++;
        if (index >= HEAP.ARR_LEN) {
            let buffer = new Uint32Array(HEAP.ARR_LEN *= 2);
            buffer.set(ARRAYS);
            HEAP.ARRAYS = ARRAYS = buffer;
        }
        ARRAYS[index] = elemType >>> 0;
        return index;
    }

    /**
     * Writes variant pairs to SLAB, registers in UNIONS.
     * @param {!Array<number>} resolved - [keyId, typedef, ...] pairs
     * @param {number} count - number of variants (resolved.length / 2)
     * @param {number} discKeyId - discriminator key id
     * @param {boolean} volatile
     * @returns {number} union registry id
     */
    function registerUnion(resolved, count, discKeyId, volatile) {
        let required = count * 2;
        if (volatile) {
            if (VOL_HEAP.PTR + required > VOL_HEAP.SLAB_LEN) {
                let buffer = new Uint32Array(VOL_HEAP.SLAB_LEN *= 2);
                buffer.set(V_SLAB);
                VOL_HEAP.SLAB = V_SLAB = buffer;
            }
            let offset = VOL_HEAP.PTR;
            for (let i = 0; i < required; i++) {
                V_SLAB[offset + i] = resolved[i];
            }
            VOL_HEAP.PTR += required;
            let id = VOL_HEAP.UNION_COUNT++;
            if ((id + 1) * 3 > VOL_HEAP.UNION_LEN) {
                let buffer = new Uint32Array(VOL_HEAP.UNION_LEN *= 2);
                buffer.set(V_UNIONS);
                VOL_HEAP.UNIONS = V_UNIONS = buffer;
            }
            V_UNIONS[id * 3] = offset;
            V_UNIONS[id * 3 + 1] = count;
            V_UNIONS[id * 3 + 2] = discKeyId;
            return id;
        }
        if (HEAP.PTR + required > HEAP.SLAB_LEN) {
            let buffer = new Uint32Array(HEAP.SLAB_LEN *= 2);
            buffer.set(SLAB);
            HEAP.SLAB = SLAB = buffer;
        }
        let offset = HEAP.PTR;
        for (let i = 0; i < required; i++) {
            SLAB[offset + i] = resolved[i];
        }
        HEAP.PTR += required;
        let id = HEAP.UNION_COUNT++;
        if ((id + 1) * 3 > HEAP.UNION_LEN) {
            let buffer = new Uint32Array(HEAP.UNION_LEN *= 2);
            buffer.set(UNIONS);
            HEAP.UNIONS = UNIONS = buffer;
        }
        UNIONS[id * 3] = offset;
        UNIONS[id * 3 + 1] = count;
        UNIONS[id * 3 + 2] = discKeyId;
        return id;
    }

    /**
     * @type {uvd.cat.SchemaBuilder<R>}
     */
    const t = {
        object: (def, opts) => objectImpl(def, false, opts),
        array: (type, opts) => arrayImpl(type, false, opts),
        union: (disc, variants) => unionImpl(disc, variants, false),
        refine: (typedef, fn) => refineImpl(typedef, fn, false),
        tuple: (first, second, third) => tupleArrayImpl(normalizeTypeArgs(first, second, third), false),
        record: (valueType) => recordImpl(valueType, false),
        or: (first, second, third) => orImpl(normalizeTypeArgs(first, second, third), false),
        exclusive: (first, second, third) => exclusiveImpl(normalizeTypeArgs(first, second, third), false),
        intersect: (first, second, third) => intersectImpl(normalizeTypeArgs(first, second, third), false),
        not: (typedef) => notImpl(typedef, false),
        when: (config) => whenImpl(config, false),
        optional: optional,
        nullable: nullable,
        string: primitiveImpl(STRING),
        number: primitiveImpl(NUMBER),
        boolean: primitiveImpl(BOOLEAN),
        bigint: primitiveImpl(BIGINT),
        date: primitiveImpl(DATE),
        uri: primitiveImpl(URI),
    };

    /**
     * @type {uvd.cat.SchemaBuilder<R>}
     */
    const v = {
        object: (def, opts) => {
            if (rewindPending) {
                rewindVolatile();
            }
            return objectImpl(def, true, opts);
        },
        array: (type, opts) => {
            if (rewindPending) {
                rewindVolatile();
            }
            return arrayImpl(type, true, opts);
        },
        union: (disc, variants) => {
            if (rewindPending) {
                rewindVolatile();
            }
            return unionImpl(disc, variants, true);
        },
        refine: (typedef, fn) => {
            if (rewindPending) { rewindVolatile(); }
            return refineImpl(typedef, fn, true);
        },
        tuple: (first, second, third) => {
            if (rewindPending) { rewindVolatile(); }
            return tupleArrayImpl(normalizeTypeArgs(first, second, third), true);
        },
        record: (valueType) => {
            if (rewindPending) { rewindVolatile(); }
            return recordImpl(valueType, true);
        },
        or: (first, second, third) => {
            if (rewindPending) { rewindVolatile(); }
            return orImpl(normalizeTypeArgs(first, second, third), true);
        },
        exclusive: (first, second, third) => {
            if (rewindPending) { rewindVolatile(); }
            return exclusiveImpl(normalizeTypeArgs(first, second, third), true);
        },
        intersect: (first, second, third) => {
            if (rewindPending) { rewindVolatile(); }
            return intersectImpl(normalizeTypeArgs(first, second, third), true);
        },
        not: (typedef) => {
            if (rewindPending) { rewindVolatile(); }
            return notImpl(typedef, true);
        },
        when: (config) => {
            if (rewindPending) { rewindVolatile(); }
            return whenImpl(config, true);
        },
        optional: optional,
        nullable: nullable,
        string: volatilePrimitiveImpl(STRING),
        number: volatilePrimitiveImpl(NUMBER),
        boolean: volatilePrimitiveImpl(BOOLEAN),
        bigint: volatilePrimitiveImpl(BIGINT),
        date: volatilePrimitiveImpl(DATE),
        uri: volatilePrimitiveImpl(URI),
    };

    let DICT = {
        KEY_DICT,
        KEY_INDEX,
    };

    return { t, v, is, guard, conform, validate, diagnose, __heap: {
        HEAP, VOL_HEAP, DICT,
        allocKind, allocValidator, allocOnSlab, lookup,
        registerObject, registerArray, registerUnion,
    } };
}

export {
    catalog, sortByKeyId,
    COMPLEX, NULLABLE, OPTIONAL, VOLATILE,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_UNION, K_REFINE, K_TUPLE,
    K_RECORD, K_OR, K_EXCLUSIVE, K_INTERSECT, K_NOT, K_CONDITIONAL,
    HAS_VALIDATOR,
};

export * from './const.js';