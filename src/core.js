/// <reference path="../global.d.ts" />
import { PathError } from "../types/types.js";

// --- BIT LAYOUT ---
// Bit 31:  COMPLEX   (0 = primitive typedef, 1 = complex typedef)
// Bit 30:  NULLABLE  (typedef accepts null)
// Bit 29:  OPTIONAL  (typedef accepts undefined)
// Bit 28:  VOLATILE  (typedef lives in volatile storage)
// Bits 0-27:
//   If COMPLEX=0: primitive type flags (up to 28 type slots)
//   If COMPLEX=1: index into KIND table

const COMPLEX = (1 << 31) >>> 0;
const NULLABLE = (1 << 30) >>> 0;
const OPTIONAL = (1 << 29) >>> 0;
const VOLATILE = (1 << 28) >>> 0;

export const BOOLEAN = (1 << 27) >>> 0;
export const NUMBER = (1 << 26) >>> 0;
export const STRING = (1 << 25) >>> 0;
export const BIGINT = (1 << 24) >>> 0;
export const DATE = (1 << 23) >>> 0;
export const URI = (1 << 22) >>> 0;

export const PRIMITIVE = (BOOLEAN | NUMBER | STRING | BIGINT | DATE | URI);
const PRIM_MASK = 0x0FFFFFFF;
const KIND_MASK = 0x0FFFFFFF;

// Backward-compatible aliases
export { NULLABLE as NULL, OPTIONAL as UNDEFINED };

// Complex kind enum (sequential, not bit flags)
const K_PRIMITIVE = 0;
const K_OBJECT = 1;
const K_ARRAY = 2;
const K_UNION = 3;
const K_REFINE = 4;

const KIND_ENUM_MASK = 0xF;
const HAS_VALIDATOR = 1 << 4;

// --- Validator opt flags (scoped by context) ---

// String validator flags
const STR_MIN_LENGTH = 1;
const STR_MAX_LENGTH = 2;
const STR_PATTERN = 4;
const STR_FORMAT = 8;

// Number validator flags
const NUM_MINIMUM = 1;
const NUM_MAXIMUM = 2;
const NUM_EX_MIN = 4;
const NUM_EX_MAX = 8;
const NUM_MULTIPLE_OF = 16;

// Array validator flags
const ARR_MIN_ITEMS = 1;
const ARR_MAX_ITEMS = 2;
const ARR_UNIQUE = 4;
const ARR_CONTAINS = 8;
const ARR_MIN_CONTAINS = 16;
const ARR_MAX_CONTAINS = 32;

// Object validator flags
const OBJ_MIN_PROPS = 1;
const OBJ_MAX_PROPS = 2;
const OBJ_PATTERN_PROPS = 4;
const OBJ_PROP_NAMES = 8;
const OBJ_DEP_REQUIRED = 16;
const OBJ_NO_ADDITIONAL = 32;

// Format enum values (string format validator)
const FMT_EMAIL = 1;
const FMT_IPV4 = 2;
const FMT_UUID = 3;
const FMT_DATETIME = 4;

// Format validation regexes
const FMT_RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FMT_RE_IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const FMT_RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FMT_RE_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

const FMT_MAP = { email: FMT_EMAIL, ipv4: FMT_IPV4, uuid: FMT_UUID, 'date-time': FMT_DATETIME };

export const STRIP = true;
export const PLAIN = true;

export const NOT_STRICT = 0;
export const STRICT_REJECT = 1;
export const STRICT_DELETE = 2;
export const STRICT_PROTO = 4;
const STRICT_MODE_MASK = 0b11;

const U16 = 1;
const U32 = 2;

/** @const @type {symbol} */
var FAIL = Symbol('FAIL');

const hasOwnProperty = Object.prototype.hasOwnProperty;

// ---------------------------------------------------------------------------
// Stateless helpers (module-level — no registry state needed)
// ---------------------------------------------------------------------------

/**
 * @param {number} typedef
 * @returns {number}
 */
function nullable(typedef) {
    return (typedef | NULLABLE) >>> 0;
}

/**
 * @param {number} typedef
 * @returns {number}
 */
function optional(typedef) {
    return (typedef | OPTIONAL) >>> 0;
}

/**
 * 
 * @param {!Array<number>} buffer
 * @returns {void} 
 */
function sortByKeyId(buffer) {
    /**
     * 
     * @param {number} i 
     * @param {number} j 
     */
    function swap(i, j) {
        let i2 = i << 1;
        let j2 = j << 1;

        let tmp = buffer[i2];
        buffer[i2] = buffer[j2];
        buffer[j2] = tmp;

        tmp = buffer[i2 + 1];
        buffer[i2 + 1] = buffer[j2 + 1];
        buffer[j2 + 1] = tmp;
    }

    /**
     * 
     * @param {number} low 
     * @param {number} high 
     * @returns {void}
     */
    function quicksort(low, high) {
        if (low >= high) {
            return;
        }

        let pivot = buffer[((low + high) >>> 1) << 1];
        let start = low;
        let end = high;

        while (start <= end) {
            while (buffer[start << 1] < pivot) {
                start++;
            }
            while (buffer[end << 1] > pivot) {
                end--;
            }

            if (start <= end) {
                swap(start, end);
                start++;
                end--;
            }
        }

        if (low < end) {
            quicksort(low, end);
        }
        if (start < high) {
            quicksort(start, high);
        }
    }

    quicksort(0, (buffer.length >> 1) - 1);
}

/**
 * @param {*} raw
 * @param {number} type
 * @returns {number}
 */
function checkNullish(raw, type) {
    return (
        raw === void 0
            ? ((type & OPTIONAL) ? 1 : 0)
            : raw === null
                ? ((type & NULLABLE) ? 1 : 0)
                : -1
    );
}

/**
 * @param {*} raw
 * @param {number} mask - only VALUE bits
 * @param {boolean} reify
 * @returns {*} parsed value, or FAIL
 */
function parseValue(raw, mask, reify) {
    let jsType = typeof raw;
    if (jsType === 'boolean') {
        return (mask & BOOLEAN) ? raw : FAIL;
    }
    if (jsType === 'number') {
        if (mask & NUMBER) {
            return raw;
        }
        if (reify) {
            if (mask & BIGINT) {
                if (!Number.isInteger(/** @type {number} */(raw))) {
                    return FAIL;
                }
                return BigInt(/** @type {number} */(raw));
            }
            if (mask & DATE) {
                let date = new Date(/** @type {number} */(raw));
                if (!isNaN(date.valueOf())) {
                    return date;
                }
            }
        }
        return FAIL;
    }
    if (jsType === 'string') {
        if (reify) {
            if (mask & DATE) {
                let date = new Date(/** @type {string} */(raw));
                if (!isNaN(date.valueOf())) {
                    return date;
                }
            }
            if ((mask & URI)) {
                try {
                    return new URL(/** @type {string} */(raw));
                } catch (_) { /* fall through */ }
            }
            if (mask & BIGINT) {
                try {
                    return BigInt(/** @type {string} */(raw));
                } catch (_) { /* fall through */ }
            }
        }
        if (mask & STRING) {
            return raw;
        }
        return FAIL;
    }
    if (
        ((mask & BIGINT) && jsType === 'bigint') ||
        ((mask & DATE) && raw instanceof Date) ||
        ((mask & URI) && raw instanceof URL)
    ) {
        return raw;
    }
    return FAIL;
}

/**
 * @param {*} raw
 * @param {number} mask - only VALUE bits
 * @returns {boolean}
 */
function checkValue(raw, mask) {
    let jsType = typeof raw;
    return (
        jsType === 'string' ? (mask & STRING) !== 0 :
            jsType === 'number' ? (mask & NUMBER) !== 0 :
                jsType === 'boolean' ? (mask & BOOLEAN) !== 0 :
                    jsType === 'bigint' ? (mask & BIGINT) !== 0 :
                        raw instanceof Date ? (mask & DATE) !== 0 :
                            raw instanceof URL ? (mask & URI) !== 0 : false
    );
}

// ---------------------------------------------------------------------------
// Registry factory
// ---------------------------------------------------------------------------

function registry() {
    // --- KEY DICTIONARY (shared between permanent and volatile) ---
    /** @type {number} */
    let keyseq = 1;
    /** @const @type {!Map<string,number>} */
    let KEY_DICT = new Map();
    /** @const @type {!Map<number,string>} */
    let KEY_INDEX = new Map();

    // --- PERMANENT STORAGE ---
    let PTR = 0;
    let SLAB_LEN = 16384;
    /** @type {!Uint32Array} */
    let SLAB = new Uint32Array(SLAB_LEN);

    let OBJ_LEN = 4096;
    let OBJ_TYPE = U16;
    let OBJ_COUNT = 0;
    /** @type {!Uint16Array | !Uint32Array} */
    let OBJECTS = new Uint16Array(OBJ_LEN);

    let ARR_LEN = 256;
    /** @type {!Uint32Array} */
    let ARRAYS = new Uint32Array(ARR_LEN);
    let ARR_COUNT = 0;

    let UNION_LEN = 128;
    let UNION_TYPE = U16;
    /** @const @type {!Array<!Uint32Array>} */
    let DISC_UNIONS = [];
    /** @type {!Uint16Array | !Uint32Array} */
    let UNIONS = new Uint16Array(UNION_LEN);

    let KIND_LEN = 2048;
    let KIND_PTR = 0;
    /** @type {!Uint32Array} */
    let KINDS = new Uint32Array(KIND_LEN);

    // --- VOLATILE STORAGE ---
    let V_PTR = 0;
    let V_SLAB_LEN = 1024;
    /** @type {!Uint32Array} */
    let V_SLAB = new Uint32Array(V_SLAB_LEN);

    let V_OBJ_LEN = 256;
    let V_OBJ_TYPE = U16;
    let V_OBJ_COUNT = 0;
    /** @type {!Uint16Array | !Uint32Array} */
    let V_OBJECTS = new Uint16Array(V_OBJ_LEN);

    let V_ARR_LEN = 64;
    /** @type {!Uint32Array} */
    let V_ARRAYS = new Uint32Array(V_ARR_LEN);
    let V_ARR_COUNT = 0;

    let V_UNION_LEN = 32;
    let V_UNION_TYPE = U16;
    /** @const @type {!Array<!Uint32Array>} */
    let V_DISC_UNIONS = [];
    /** @type {!Uint16Array | !Uint32Array} */
    let V_UNIONS = new Uint16Array(V_UNION_LEN);

    let V_KIND_LEN = 512;
    let V_KIND_PTR = 0;
    /** @type {!Uint32Array} */
    let V_KINDS = new Uint32Array(V_KIND_LEN);

    // --- PERMANENT VALIDATOR STORAGE ---
    let VAL_PTR = 0;
    let VAL_LEN = 512;
    /** @type {!Float64Array} */
    let VALIDATORS = new Float64Array(VAL_LEN);
    /** @const @type {!Array<!RegExp>} */
    let REGEX_CACHE = [];

    // --- VOLATILE VALIDATOR STORAGE ---
    let V_VAL_PTR = 0;
    let V_VAL_LEN = 128;
    /** @type {!Float64Array} */
    let V_VALIDATORS = new Float64Array(V_VAL_LEN);
    /** @const @type {!Array<!RegExp>} */
    let V_REGEX_CACHE = [];

    // --- CALLBACK STORAGE (for refine) ---
    /** @const @type {!Array<function(*): boolean>} */
    let CALLBACKS = [];
    /** @const @type {!Array<function(*): boolean>} */
    let V_CALLBACKS = [];

    let rewindPending = false;

    // --- INTERNAL HELPERS ---

    /**
     * @returns {void}
     */
    function rewindVolatile() {
        V_PTR = 0;
        V_OBJ_COUNT = 0;
        V_ARR_COUNT = 0;
        V_KIND_PTR = 0;
        V_VAL_PTR = 0;
        V_DISC_UNIONS.length = 0;
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
     * @param {number} complexType
     * @param {number} registryIndex
     * @param {boolean} volatile
     * @param {number} slots
     * @returns {number}
     */
    function allocKind(header, registryIndex, volatile, slots) {
        if (volatile) {
            let ptr = V_KIND_PTR;
            if (ptr + slots > V_KIND_LEN) {
                let buffer = new Uint32Array(V_KIND_LEN *= 2);
                buffer.set(V_KINDS);
                V_KINDS = buffer;
            }
            V_KINDS[ptr] = header;
            V_KINDS[ptr + 1] = registryIndex;
            V_KIND_PTR += slots;
            return ptr;
        }
        let ptr = KIND_PTR;
        if (ptr + slots > KIND_LEN) {
            let buffer = new Uint32Array(KIND_LEN *= 2);
            buffer.set(KINDS);
            KINDS = buffer;
        }
        KINDS[ptr] = header;
        KINDS[ptr + 1] = registryIndex;
        KIND_PTR += slots;
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
            if (V_VAL_PTR + needed > V_VAL_LEN) {
                let buffer = new Float64Array(V_VAL_LEN *= 2);
                buffer.set(V_VALIDATORS);
                V_VALIDATORS = buffer;
            }
            let ptr = V_VAL_PTR;
            V_VALIDATORS[ptr] = vHeader;
            for (let i = 0; i < payloads.length; i++) {
                V_VALIDATORS[ptr + 1 + i] = payloads[i];
            }
            V_VAL_PTR += needed;
            return ptr;
        }
        if (VAL_PTR + needed > VAL_LEN) {
            let buffer = new Float64Array(VAL_LEN *= 2);
            buffer.set(VALIDATORS);
            VALIDATORS = buffer;
        }
        let ptr = VAL_PTR;
        VALIDATORS[ptr] = vHeader;
        for (let i = 0; i < payloads.length; i++) {
            VALIDATORS[ptr + 1 + i] = payloads[i];
        }
        VAL_PTR += needed;
        return ptr;
    }

    /**
     * @param {number} primConst
     * @param {!Object} opts
     * @param {boolean} volatile
     * @returns {{vHeader: number, payloads: !Array<number>}}
     */
    function buildValidatorPayload(primConst, opts, volatile) {
        let vHeader = 0;
        /** @type {!Array<number>} */
        let payloads = [];
        if (primConst & STRING) {
            if (opts.minLength !== void 0) {
                vHeader |= STR_MIN_LENGTH;
                payloads.push(opts.minLength);
            }
            if (opts.maxLength !== void 0) {
                vHeader |= STR_MAX_LENGTH;
                payloads.push(opts.maxLength);
            }
            if (opts.pattern !== void 0) {
                vHeader |= STR_PATTERN;
                let cache = volatile ? V_REGEX_CACHE : REGEX_CACHE;
                let idx = cache.push(opts.pattern instanceof RegExp ? opts.pattern : new RegExp(opts.pattern)) - 1;
                payloads.push(idx);
            }
            if (opts.format !== void 0) {
                let fmt = FMT_MAP[opts.format];
                if (fmt === void 0) {
                    throw new Error('Unknown string format: ' + opts.format);
                }
                vHeader |= STR_FORMAT;
                payloads.push(fmt);
            }
        } else if (primConst & NUMBER) {
            if (opts.minimum !== void 0) {
                vHeader |= NUM_MINIMUM;
                payloads.push(opts.minimum);
            }
            if (opts.maximum !== void 0) {
                vHeader |= NUM_MAXIMUM;
                payloads.push(opts.maximum);
            }
            if (opts.exclusiveMinimum !== void 0) {
                vHeader |= NUM_EX_MIN;
                payloads.push(opts.exclusiveMinimum);
            }
            if (opts.exclusiveMaximum !== void 0) {
                vHeader |= NUM_EX_MAX;
                payloads.push(opts.exclusiveMaximum);
            }
            if (opts.multipleOf !== void 0) {
                vHeader |= NUM_MULTIPLE_OF;
                payloads.push(opts.multipleOf);
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
     * @param {number} typedef
     * @param {function(*): boolean} fn
     * @param {boolean} volatile
     * @returns {number}
     */
    function refineImpl(typedef, fn, volatile) {
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
        return flags >>> 0;
    }

    /**
     * @param {number} type
     * @returns {string}
     */
    function describeType(type) {
        /** @type {!Array<string>} */
        let parts = [];
        if (type & OPTIONAL) parts.push('undefined');
        if (type & NULLABLE) parts.push('null');
        if (type & COMPLEX) {
            let volatile = (type & VOLATILE) !== 0;
            let ptr = type & KIND_MASK;
            let kinds = volatile ? V_KINDS : KINDS;
            let header = kinds[ptr];
            let ct = header & KIND_ENUM_MASK;
            if (ct === K_PRIMITIVE) {
                let primBits = header & PRIMITIVE;
                if (primBits & BOOLEAN) {
                    parts.push('boolean');
                }
                if (primBits & NUMBER) {
                    parts.push('number');
                }
                if (primBits & STRING) {
                    parts.push('string');
                }
                if (primBits & BIGINT) {
                    parts.push('bigint');
                }
                if (primBits & DATE) {
                    parts.push('Date');
                }
                if (primBits & URI) {
                    parts.push('URL');
                }
            } else if (ct === K_ARRAY) {
                parts.push('Array');
            } else if (ct === K_UNION) {
                parts.push('Union');
            } else if (ct === K_OBJECT) {
                parts.push('Object');
            } else if (ct === K_REFINE) {
                parts.push('Refined');
            }
        } else {
            if (type & BOOLEAN) {
                parts.push('boolean');
            }
            if (type & NUMBER) {
                parts.push('number');
            }
            if (type & STRING) {
                parts.push('string');
            }
            if (type & BIGINT) {
                parts.push('bigint');
            }
            if (type & DATE) {
                parts.push('Date');
            }
            if (type & URI) {
                parts.push('URL');
            }
        }
        return parts.join(' | ') || 'unknown';
    }

    // --- SCHEMA BUILDERS ---

    /**
     * @throws
     * @param {!Schema} definition
     * @param {boolean} volatile
     * @returns {number}
     */
    function objectImpl(definition, volatile, opts) {
        let keys = Object.keys(definition);
        let count = keys.length;
        let required = count * 2;
        /** @type {!Array<number>} */
        let resolved = new Array(required);
        for (let i = 0, j = 0; i < count; i++, j += 2) {
            let key = keys[i];
            let type = definition[key];
            let jsType = typeof type;
            let isObject = jsType === 'object';
            let isNumber = jsType === 'number';
            if (type === null || (!isNumber && !isObject)) {
                throw new Error('Invalid type for key ' + key);
            } else if (isNumber) {
                let isComplex = (type >>> 31) === 1;
                if (isComplex) {
                    // Strip the top 4 bits to get the raw payload
                    let payload = type & PRIM_MASK;

                    // If they OR'd a primitive, the payload will be artificially massive
                    if (payload >= KIND_PTR) {
                        throw new Error('Object corruption at key ' + key + '. You cannot use the bitwise OR operator (|) to combine a complex type with a primitive type');
                    }
                }
            }
            if (isObject) {
                type = objectImpl(/** @type {!Schema} */(type), volatile);
            }
            resolved[j] = lookup(key);
            resolved[j + 1] = /** @type {number} */(type) >>> 0;
        }
        /* 
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
        let hasValidator = opts !== void 0;
        if (hasValidator) {
            let vHeader = 0;
            /** @type {!Array<number>} */
            let payloads = [];
            if (opts.minProperties !== void 0) {
                vHeader |= OBJ_MIN_PROPS;
                payloads.push(opts.minProperties);
            }
            if (opts.maxProperties !== void 0) {
                vHeader |= OBJ_MAX_PROPS;
                payloads.push(opts.maxProperties);
            }
            if (opts.patternProperties !== void 0) {
                vHeader |= OBJ_PATTERN_PROPS;
                let patterns = Object.keys(opts.patternProperties);
                let cache = volatile ? V_REGEX_CACHE : REGEX_CACHE;
                payloads.push(patterns.length);
                for (let i = 0; i < patterns.length; i++) {
                    let re = patterns[i] instanceof RegExp ? patterns[i] : new RegExp(patterns[i]);
                    let idx = cache.push(re) - 1;
                    payloads.push(idx);
                    payloads.push(opts.patternProperties[patterns[i]] >>> 0);
                }
            }
            if (opts.propertyNames !== void 0) {
                vHeader |= OBJ_PROP_NAMES;
                payloads.push(opts.propertyNames >>> 0);
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
        if (volatile) {
            if (V_PTR + required > V_SLAB_LEN) {
                let buffer = new Uint32Array(V_SLAB_LEN *= 2);
                buffer.set(V_SLAB);
                V_SLAB = buffer;
            }
            let offset = V_PTR;
            for (let i = 0; i < required; i++) {
                V_SLAB[offset + i] = resolved[i];
            }
            if ((V_OBJ_COUNT + 1) * 2 > V_OBJ_LEN) {
                let buffer = V_OBJ_TYPE === U16 ?
                    new Uint16Array(V_OBJ_LEN *= 2) :
                    new Uint32Array(V_OBJ_LEN *= 2);
                buffer.set(V_OBJECTS);
                V_OBJECTS = buffer;
            }
            if (V_OBJ_TYPE === U16 && V_PTR + required > 65535) {
                let buffer = new Uint32Array(V_OBJ_LEN);
                buffer.set(V_OBJECTS);
                V_OBJECTS = buffer;
                V_OBJ_TYPE = U32;
            }
            let id = V_OBJ_COUNT++;
            V_OBJECTS[id * 2] = offset;
            V_OBJECTS[id * 2 + 1] = count;
            V_PTR += required;
            let kindHeader = hasValidator ? (K_OBJECT | HAS_VALIDATOR) : K_OBJECT;
            let slots = hasValidator ? 3 : 2;
            let kindPtr = allocKind(kindHeader, id, true, slots);
            if (hasValidator) {
                V_KINDS[kindPtr + 2] = valIdx;
            }
            return (COMPLEX | VOLATILE | kindPtr) >>> 0;
        }
        // Permanent path
        if (PTR + required > SLAB_LEN) {
            let buffer = new Uint32Array(SLAB_LEN *= 2);
            buffer.set(SLAB);
            SLAB = buffer;
        }
        if (OBJ_TYPE === U16 && PTR + required > 65535) {
            let buffer = new Uint32Array(OBJ_LEN);
            buffer.set(OBJECTS);
            OBJECTS = buffer;
            OBJ_TYPE = U32;
        }
        let offset = PTR;
        for (let i = 0; i < required; i++) {
            SLAB[offset + i] = resolved[i];
        }
        if ((OBJ_COUNT + 1) * 2 > OBJ_LEN) {
            let buffer = OBJ_TYPE === U16 ?
                new Uint16Array(OBJ_LEN *= 2) :
                new Uint32Array(OBJ_LEN *= 2);
            buffer.set(OBJECTS);
            OBJECTS = buffer;
        }
        let id = OBJ_COUNT++;
        OBJECTS[id * 2] = offset;
        OBJECTS[id * 2 + 1] = count;
        PTR += required;
        let kindHeader = hasValidator ? (K_OBJECT | HAS_VALIDATOR) : K_OBJECT;
        let slots = hasValidator ? 3 : 2;
        let kindPtr = allocKind(kindHeader, id, false, slots);
        if (hasValidator) {
            KINDS[kindPtr + 2] = valIdx;
        }
        return (COMPLEX | kindPtr) >>> 0;
    }

    /**
     * @throws
     * @param {number} elemType
     * @param {boolean} volatile
     * @returns {number}
     */
    function arrayImpl(elemType, volatile, opts) {
        if (typeof elemType !== 'number') {
            throw new Error('array element type must be a number typedef');
        }
        let hasVal = opts !== void 0;
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
        if (volatile) {
            let index = V_ARR_COUNT++;
            if (index >= V_ARR_LEN) {
                let buffer = new Uint32Array(V_ARR_LEN *= 2);
                buffer.set(V_ARRAYS);
                V_ARRAYS = buffer;
            }
            V_ARRAYS[index] = elemType >>> 0;
            let kindHeader = hasVal ? (K_ARRAY | HAS_VALIDATOR) : K_ARRAY;
            let slots = hasVal ? 3 : 2;
            let kindPtr = allocKind(kindHeader, index, true, slots);
            if (hasVal) V_KINDS[kindPtr + 2] = valIdx;
            return (COMPLEX | VOLATILE | kindPtr) >>> 0;
        }
        let index = ARR_COUNT++;
        if (index >= ARR_LEN) {
            let buffer = new Uint32Array(ARR_LEN *= 2);
            buffer.set(ARRAYS);
            ARRAYS = buffer;
        }
        ARRAYS[index] = elemType >>> 0;
        let kindHeader = hasVal ? (K_ARRAY | HAS_VALIDATOR) : K_ARRAY;
        let slots = hasVal ? 3 : 2;
        let kindPtr = allocKind(kindHeader, index, false, slots);
        if (hasVal) KINDS[kindPtr + 2] = valIdx;
        return (COMPLEX | kindPtr) >>> 0;
    }

    /**
     * @throws
     * @param {string} discriminator
     * @param {!IObject<string,number>} variants
     * @param {boolean} volatile
     * @returns {number}
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
        let storage = new Uint32Array(count * 2);
        for (let i = 0; i < count; i++) {
            let type = variants[keys[i]];
            if (typeof type !== 'number') {
                throw new Error('Invalid variant type for key ' + keys[i]);
            }
            storage[i * 2] = lookup(keys[i]);
            storage[i * 2 + 1] = type >>> 0;
        }
        if (volatile) {
            let index = V_DISC_UNIONS.push(storage) - 1;
            if (index >= V_UNION_LEN) {
                let buffer = V_UNION_TYPE === U16 ?
                    new Uint16Array(V_UNION_LEN *= 2) :
                    new Uint32Array(V_UNION_LEN *= 2);
                buffer.set(V_UNIONS);
                V_UNIONS = buffer;
            }
            let id = lookup(discriminator);
            if (V_UNION_TYPE === U16 && keyseq > 65535) {
                let buffer = new Uint32Array(V_UNION_LEN);
                buffer.set(V_UNIONS);
                V_UNIONS = buffer;
                V_UNION_TYPE = U32;
            }
            V_UNIONS[index] = id;
            let kindId = allocKind(K_UNION, index, true, 2);
            return (COMPLEX | VOLATILE | kindId) >>> 0;
        }
        let index = DISC_UNIONS.push(storage) - 1;
        if (index >= UNION_LEN) {
            let buffer = UNION_TYPE === U16 ?
                new Uint16Array(UNION_LEN *= 2) :
                new Uint32Array(UNION_LEN *= 2);
            buffer.set(UNIONS);
            UNIONS = buffer;
        }
        let id = lookup(discriminator);
        if (UNION_TYPE === U16 && keyseq > 65535) {
            let buffer = new Uint32Array(UNION_LEN);
            buffer.set(UNIONS);
            UNIONS = buffer;
            UNION_TYPE = U32;
        }
        UNIONS[index] = id;
        let kindId = allocKind(K_UNION, index, false, 2);
        return (COMPLEX | kindId) >>> 0;
    }

    /**
     * @param {*} holder
     * @param {string|number} slot
     * @param {number} type
     * @param {boolean} reify
     * @returns {boolean}
     */
    function _parseSlot(holder, slot, type, reify) {
        let raw = holder[slot];
        let nc = /*@__INLINE__*/ checkNullish(raw, type);
        if (nc === 0) {
            return false;
        }
        if (nc === 1) {
            return true;
        }
        if (type & COMPLEX) {
            return _conform(raw, type, reify);
        }
        let vm = type & PRIM_MASK;
        if (vm !== 0) {
            let result = parseValue(raw, vm, reify);
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
    function _check(data, typedef, strict) {
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
                return checkValue(data, header & PRIMITIVE);
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
                        if (!_check(item, innerType, strict)) {
                            return false;
                        }
                        continue;
                    }
                    if (innerType & PRIMITIVE) {
                        if (!checkValue(item, innerType & PRIM_MASK)) {
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
                        if (!_check(item, type, strict)) {
                            return false;
                        }
                        continue;
                    }
                    if (type & PRIMITIVE) {
                        if (!checkValue(item, type & PRIM_MASK)) {
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
                let discKey = KEY_INDEX.get(unions[ri]);
                if (discKey === void 0) {
                    return false;
                }
                let discUnions = volatile ? V_DISC_UNIONS : DISC_UNIONS;
                let valueId = KEY_DICT.get(data[discKey]);
                if (valueId === void 0) {
                    return false;
                }
                let variants = discUnions[ri];
                let length = variants.length;
                for (let i = 0; i < length; i += 2) {
                    if (variants[i] === valueId) {
                        return _check(data, variants[i + 1], strict);
                    }
                }
                return false;
            }
            if (ct === K_REFINE) {
                return _check(data, ri, strict);
            }
            return false;
        }
        let valueMask = typedef & PRIM_MASK;
        if (valueMask === 0) {
            return false;
        }
        return checkValue(data, valueMask);
    }

    /**
     * @throws
     * @param {*} data
     * @param {number} typedef
     * @param {number=} strict
     * @returns {void}
     */
    function guard(data, typedef, strict) {
        if (!check(data, typedef, strict)) {
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
        let nc = /*@__INLINE__*/ checkNullish(data, typedef);
        if (nc !== -1) {
            return nc === 1;
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
                let unions = volatile ? V_UNIONS : UNIONS;
                let discUnions = volatile ? V_DISC_UNIONS : DISC_UNIONS;
                let discKey = KEY_INDEX.get(unions[ri]);
                if (discKey === void 0) {
                    return false;
                }
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    return false;
                }
                let valueId = KEY_DICT.get(data[discKey]);
                if (valueId === void 0) {
                    return false;
                }
                let variants = discUnions[ri];
                let count = variants.length;
                for (let i = 0; i < count; i += 2) {
                    if (variants[i] === valueId) {
                        return _conform(data, variants[i + 1], reify);
                    }
                }
                return false;
            }
            if (ct === K_REFINE) {
                return _conform(data, ri, reify);
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
     * @returns {!Array<PathError>}
     */
    function diagnose(data, typedef) {
        rewindPending = true;
        /** @type {!Array<PathError>} */
        let errors = [];
        _diagnose(data, typedef, '', errors);
        return errors;
    }

    /**
     * @param {*} data
     * @param {number} typedef
     * @param {string} path
     * @param {!Array<PathError>} errors
     * @returns {void}
     */
    function _diagnose(data, typedef, path, errors) {
        if (data === void 0) {
            if (!(typedef & OPTIONAL)) {
                errors.push({ path, message: 'unexpected undefined, expected ' + describeType(typedef) });
            }
            return;
        }
        if (data === null) {
            if (!(typedef & NULLABLE)) {
                errors.push({ path, message: 'unexpected null, expected ' + describeType(typedef) });
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
                if (primBits === 0 || !checkValue(data, primBits)) {
                    /** @type {string} */
                    let type = typeof data;
                    if (type === 'object') {
                        if (data instanceof Date) {
                            type = 'Date';
                        } else if (data instanceof URL) {
                            type = 'URL';
                        }
                    }
                    errors.push({ path, message: 'expected ' + describeType(typedef) + ', got ' + type });
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
                let discUnions = volatile ? V_DISC_UNIONS : DISC_UNIONS;
                let discKey = KEY_INDEX.get(unions[ri]);
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
                let arr = discUnions[ri];
                let length = arr.length;
                for (let i = 0; i < length; i += 2) {
                    if (arr[i] === valueId) {
                        _diagnose(data, arr[i + 1], path, errors);
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
            errors.push({ path, message: 'invalid type definition (unknown complex kind)' });
            return;
        }
        let valueMask = typedef & PRIM_MASK;
        if (valueMask === 0) {
            errors.push({ path, message: 'invalid type definition (no type bits set)' });
            return;
        }
        if (!checkValue(data, valueMask)) {
            /** @type {string} */
            let type = typeof data;
            if (type === 'object') {
                if (data instanceof Date) {
                    type = 'Date';
                } else if (data instanceof URL) {
                    type = 'URL';
                }
            }
            errors.push({ path, message: 'expected ' + describeType(typedef) + ', got ' + type });
        }
    }

    /**
     * @param {*} data
     * @param {number} typedef
     * @param {number=} strict
     * @returns {boolean}
     */
    function check(data, typedef, strict) {
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
        let result = _check(data, typedef, _strict);
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
        if (primBits & NUMBER) {
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
     * @param {!Array} data
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
     * @param {!Object} data
     * @param {number} valIdx
     * @param {boolean} volatile
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
                        (type & PRIMITIVE) ? checkValue(raw, type & PRIM_MASK) :
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
                if (!checkValue(data, primBits)) {
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
                let unions = volatile ? V_UNIONS : UNIONS;
                let discUnions = volatile ? V_DISC_UNIONS : DISC_UNIONS;
                let discKey = KEY_INDEX.get(unions[ri]);
                if (discKey === void 0) return false;
                if (typeof data !== 'object' || data === null || Array.isArray(data)) return false;
                let valueId = KEY_DICT.get(data[discKey]);
                let variants = discUnions[ri];
                let length = variants.length;
                for (let i = 0; i < length; i += 2) {
                    if (variants[i] === valueId) {
                        return _validate(data, variants[i + 1]);
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
            return false;
        }
        let valueMask = typedef & PRIM_MASK;
        if (valueMask === 0) return false;
        return checkValue(data, valueMask);
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

    // --- API OBJECTS ---
    // 
    const t = {
        object: (def, opts) => objectImpl(def, false, opts),
        array: (type, opts) => arrayImpl(type, false, opts),
        union: (disc, variants) => unionImpl(disc, variants, false),
        refine: (typedef, fn) => refineImpl(typedef, fn, false),
        optional: optional,
        nullable: nullable,
        string: primitiveImpl(STRING),
        number: primitiveImpl(NUMBER),
        boolean: primitiveImpl(BOOLEAN),
        bigint: primitiveImpl(BIGINT),
        date: primitiveImpl(DATE),
        uri: primitiveImpl(URI),
    };

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
        optional: optional,
        nullable: nullable,
        string: volatilePrimitiveImpl(STRING),
        number: volatilePrimitiveImpl(NUMBER),
        boolean: volatilePrimitiveImpl(BOOLEAN),
        bigint: volatilePrimitiveImpl(BIGINT),
        date: volatilePrimitiveImpl(DATE),
        uri: volatilePrimitiveImpl(URI),
    };

    return { t, v, check, guard, conform, validate, diagnose };
}

export { registry };
