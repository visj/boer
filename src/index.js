/// <reference path="../types/types.d.ts" />

export const UNDEFINED = (1 << 31) >>> 0;
export const NULL = (1 << 30) >>> 0;
export const BOOLEAN = (1 << 29) >>> 0;
export const NUMBER = (1 << 28) >>> 0;
export const STRING = (1 << 27) >>> 0;
export const ARRAY = (1 << 23) >>> 0;
export const OBJECT = (1 << 22) >>> 0;

// Move these to extended #TODO
export const BIGINT = (1 << 26) >>> 0;
export const DATE = (1 << 25) >>> 0;
export const URI = (1 << 24) >>> 0;
export const UNION = (1 << 21) >>> 0;

export const VALUE = (BOOLEAN | NUMBER | STRING | BIGINT | DATE | URI);
export const ID_MASK = 0x001FFFFF;

export const STRIP = true;
export const PLAIN = true;

// --- DICTIONARY ---
/** @type {number} */
var keyseq = 1;
/** @const @type {!Map<string,number>} */
var KEY_DICT = new Map();
/** @const @type {!Map<number,string>} */
var KEY_INDEX = new Map();

const U16 = 1;
const U32 = 2;

var PTR = 0;
var SLAB_LEN = 16384;
/**
 * @type {!Uint32Array} 
 */
var SLAB = new Uint32Array(SLAB_LEN);

var OBJ_LEN = 4096;
var OBJ_TYPE = U16;
var OBJ_COUNT = 0;
/** 
 * @type {!Uint16Array | !Uint32Array}
 */
var OBJECTS = new Uint16Array(OBJ_LEN);
var ARR_LEN = 256;
/** 
 * @type {!Uint32Array}
 */
var ARRAYS = new Uint32Array(ARR_LEN);
var ARR_COUNT = 0;

var UNION_LEN = 128;
var UNION_TYPE = U16;
/** 
 * V8 inline small Typed Arrays on-heap
 * https://chromium.googlesource.com/v8/v8/+/refs/heads/7.6-lkgr/BUILD.gn
 * The size limit is 64 bytes (unrelated to DISC_LEN...)
 * Most unions should fit inside this threshold, so we likely don't need
 * to manage yet another continous memory block
 * @const 
 * @type {!Array<!Uint32Array>}
 */
var DISC_UNIONS = [];
/** @type {!Uint16Array | !Uint32Array} */
var UNIONS = new Uint16Array(UNION_LEN);

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

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
 * Check null/undefined against a type mask.
 * Returns:  1 = allowed (caller should accept and move on)
 *           0 = disallowed (caller should fail)
 *          -1 = value is not null/undefined, keep going
 * @param {*} raw
 * @param {number} type
 * @returns {number}
 */
function checkNullish(raw, type) {
    return (
        raw === void 0
            ? ((type & UNDEFINED) ? 1 : 0) // raw is undefined, return bit check
            : raw === null
                ? ((type & NULL) ? 1 : 0)  // raw is null, return bit check
                : -1
    );
}

/**
 * Build a human-readable type description from a type mask.
 * @param {number} type
 * @returns {string}
 */
function describeType(type) {
    /** @type {!Array<string>} */
    let parts = [];
    if (type & UNDEFINED) parts.push('undefined');
    if (type & NULL) parts.push('null');
    if (type & BOOLEAN) parts.push('boolean');
    if (type & NUMBER) parts.push('number');
    if (type & STRING) parts.push('string');
    if (type & BIGINT) parts.push('bigint');
    if (type & DATE) parts.push('Date');
    if (type & URI) parts.push('URL');
    if (type & ARRAY) parts.push('Array');
    if (type & UNION) parts.push('Union');
    if (type & OBJECT) parts.push('Object');
    return parts.join(' | ') || 'unknown';
}

/**
 * Register an object schema. Accepts inline nested plain objects which are
 * auto-registered recursively.
 *
 * @throws
 * @param {!Schema} definition
 * @returns {number}
 */
export function object(definition) {
    let keys = Object.keys(definition);
    let count = keys.length;
    let required = count * 2;
    // resolve all nested inline objects and lookup all keys FIRST.
    // This must happen before we reserve our slab region, because recursive
    // object() calls advance PTR and write to the slab.
    /** @type {!Array<number>} */
    let resolvedKeys = new Array(count);
    /** @type {!Array<number>} */
    let resolvedTypes = new Array(count);
    for (let i = 0; i < count; i++) {
        let key = keys[i];
        let type = definition[key];
        let jsType = typeof type;
        let isObject = jsType === 'object';
        if (type === null || (jsType !== 'number' && !isObject)) {
            throw new Error('Invalid type for key ' + key);
        }
        if (isObject) {
            type = object(/** @type {!Schema} */(type));
        }
        resolvedKeys[i] = lookup(key);
        resolvedTypes[i] = /** @type {number} */(type) >>> 0;
    }
    // now that all children are registered, reserve our slab region.
    // Re-check capacity since recursive calls may have grown the slab.
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
    for (let i = 0; i < count; i++) {
        SLAB[offset + (i * 2)] = resolvedKeys[i];
        SLAB[offset + (i * 2) + 1] = resolvedTypes[i];
    }
    // Re-check OBJECTS capacity since recursive calls may have grown it.
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
    return (OBJECT | id) >>> 0;
}

/**
 * @throws
 * @param {number} elemType — the element typedef (any valid typedef)
 * @returns {number}
 */
export function array(elemType) {
    if (typeof elemType !== 'number') {
        throw new Error('array element type must be a number typedef');
    }
    let index = ARR_COUNT++;
    if (index >= ARR_LEN) {
        let buffer = new Uint32Array(ARR_LEN *= 2);
        buffer.set(ARRAYS);
        ARRAYS = buffer;
    }
    ARRAYS[index] = elemType >>> 0;
    return (ARRAY | index) >>> 0;
}

/**
 * @throws
 * @param {string} discriminator
 * @param {!IObject<string,number>} variants
 * @returns {number}
 */
export function union(discriminator, variants) {
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
    let index = DISC_UNIONS.push(storage) - 1;
    if (index >= UNION_LEN) {
        let buffer = UNION_TYPE === U16 ?
            new Uint16Array(UNION_LEN *= 2) :
            new Uint32Array(UNION_LEN *= 2);
        buffer.set(UNIONS);
        UNIONS = buffer;
    }
    let id = lookup(discriminator);;
    if (UNION_TYPE === U16 && keyseq > 65535) {
        let buffer = new Uint32Array(UNION_LEN);
        buffer.set(UNIONS);
        UNIONS = buffer;
        UNION_TYPE = U32;
    }
    UNIONS[index] = id;
    return (UNION | index) >>> 0;
}

/** 
 * @const
 * @type {symbol}
 * Use this to cvercome that javascript
 * doesn't support free tuple return types, like Go (res, err)
 */
var FAIL = Symbol('FAIL');

/**
 * @param {*} raw
 * @param {number} mask - only VALUE bits
 * @param {boolean} reify
 * @returns {*} parsed value, or FAIL
 */
function parseValue(raw, mask, reify) {
    let jsType = typeof raw;
    // --- JSON-native: boolean ---
    if (jsType === 'boolean') {
        return (mask & BOOLEAN) ? raw : FAIL;
    }
    // --- JSON-native: number ---
    if (jsType === 'number') {
        if (mask & NUMBER) {
            return raw;
        }
        if (reify) {
            // A number could also feed into BIGINT (integer check) or DATE (timestamp).
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
    // --- JSON-native: string (may feed rich types) ---
    if (jsType === 'string') {
        if (reify) {
            if (mask & DATE) {
                let date = new Date(/** @type {string} */(raw));
                if (!isNaN(date.valueOf())) {
                    return date;
                }
                // Date parse failed — only fall through if other types accept strings.
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
        // All string-consuming types failed.
        return FAIL;
    }
    // Before, we had to check type first,
    // but here we already checked other types,
    // no need to test against instanceof if the bit is not set
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

/**
 * @throws
 * @param {*} json 
 * @param {number} typedef 
 * @returns {void}
 */
export function guard(json, typedef) {
    if (!check(json, typedef)) {
        throw diagnose(json, typedef);
    }
}

/**
 * @param {*} json
 * @param {number} typedef
 * @returns {boolean}
 */
export function check(json, typedef) {
    if (json === void 0) {
        return (typedef & UNDEFINED) !== 0;
    }
    if (json === null) {
        return (typedef & NULL) !== 0;
    }
    if (typedef & ARRAY) {
        if (!Array.isArray(json)) {
            return false;
        }
        let innerType = ARRAYS[typedef & ID_MASK];
        let length = json.length;
        for (let i = 0; i < length; i++) {
            let raw = json[i];
            if (
                raw === void 0 ? (innerType & UNDEFINED) === 0 :
                    raw === null ? (innerType & NULL) === 0 :
                        (innerType & (ARRAY | UNION | OBJECT)) ? !check(raw, innerType) :
                            (innerType & VALUE) ? !checkValue(raw, innerType & VALUE) :
                                true // true as in, truly invalid...
            ) {
                return false;
            }
        }
        return true;
    }
    if (typedef & UNION) {
        let id = typedef & ID_MASK;
        let discKey = KEY_INDEX.get(UNIONS[id]);
        if (discKey === void 0) {
            return false;
        }
        if (typeof json !== 'object' || json === null || Array.isArray(json)) {
            return false;
        }
        let valueId = KEY_DICT.get(json[discKey]);
        let variants = DISC_UNIONS[id];
        let length = variants.length;
        for (let i = 0; i < length; i += 2) {
            if (variants[i] === valueId) {
                return check(json, variants[i + 1]);
            }
        }
        return false;
    }
    if (typedef & OBJECT) {
        if (typeof json !== 'object' || json === null || Array.isArray(json)) {
            return false;
        }
        let id = typedef & ID_MASK;
        let offset = OBJECTS[id * 2];
        let length = OBJECTS[id * 2 + 1];
        for (let i = 0; i < length; i++) {
            let key = KEY_INDEX.get(SLAB[offset + (i * 2)]);
            if (key === void 0) {
                return false;
            }
            let type = SLAB[offset + (i * 2) + 1];
            let raw = json[key];
            if (
                raw === void 0 ? (type & UNDEFINED) === 0 :
                    raw === null ? (type & NULL) === 0 :
                        (type & (ARRAY | UNION | OBJECT)) ? !check(raw, type) :
                            (type & VALUE) ? !checkValue(raw, type & VALUE) :
                                true // true as in, truly invalid...
            ) {
                return false;
            }
        }
        return true;
    }
    let valueMask = typedef & VALUE;
    if (valueMask === 0) {
        return false;
    }
    // Top-level primitive or type union
    return checkValue(json, valueMask);
}
/**
 * @param {*} json
 * @param {number} typedef
 * @param {boolean=} preserve
 * @returns {boolean}
 */
export function conform(json, typedef, preserve) {
    return _conform(json, typedef, !preserve);
}

/**
 * @param {*} json
 * @param {number} typedef
 * @param {boolean} reify
 * @returns {boolean}
 */
export function _conform(json, typedef, reify) {
    let nc = /*@__INLINE__*/ checkNullish(json, typedef);
    if (nc !== -1) {
        return nc === 1;
    }
    if (typedef & ARRAY) {
        if (!Array.isArray(json)) {
            return false;
        }
        let elemType = ARRAYS[typedef & ID_MASK];
        let length = json.length;
        for (let i = 0; i < length; i++) {
            if (!_parseSlot(json, i, elemType, reify)) {
                return false;
            }
        }
        return true;
    }
    if (typedef & UNION) {
        let id = typedef & ID_MASK;
        let discKey = KEY_INDEX.get(UNIONS[id]);
        if (discKey === void 0) {
            return false;
        }
        if (typeof json !== 'object' || json === null || Array.isArray(json)) {
            return false;
        }
        let valueId = KEY_DICT.get(json[discKey]);
        if (valueId === void 0) {
            return false;
        }
        let variants = DISC_UNIONS[id];
        let count = variants.length;
        for (let i = 0; i < count; i += 2) {
            if (variants[i] === valueId) {
                return _conform(json, variants[i + 1], reify);
            }
        }
        return false;
    }
    if (typedef & OBJECT) {
        if (typeof json !== 'object' || Array.isArray(json)) {
            return false;
        }
        let id = typedef & ID_MASK;
        let offset = OBJECTS[id * 2];
        let length = OBJECTS[id * 2 + 1];
        for (let i = 0; i < length; i++) {
            let key = KEY_INDEX.get(SLAB[offset + (i * 2)]);
            if (key === void 0) {
                return false;
            }
            let type = SLAB[offset + (i * 2) + 1];
            if (!_parseSlot(json, key, type, reify)) {
                return false;
            }
        }
        return true;
    }
    let valueMask = typedef & VALUE;
    if (valueMask === 0) {
        return false;
    }
    // Top-level primitive or type union
    return parseValue(json, valueMask, reify) !== FAIL;
}

/**
 * Parse a single slot (array index or object key) in-place.
 * @param {*} holder - the array or object
 * @param {string|number} slot - index or key
 * @param {number} type - the field/element typedef
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
    if (type & (ARRAY | UNION | OBJECT)) {
        return _conform(raw, type, reify);
    }
    let vm = type & VALUE;
    if (vm !== 0) {
        let result = parseValue(raw, vm, reify);
        if (result === FAIL) return false;
        holder[slot] = result;
        return true;
    }
    return false;
}

/**
 * @param {*} json
 * @param {number} typedef
 * @param {boolean=} strip
 * @returns {boolean}
 */
export function strict(json, typedef, strip) {
    if (json == null || typeof json !== 'object') {
        // Primitives, null, undefined — delegate to check.
        return check(json, typedef);
    }
    if (typedef & ARRAY) {
        if (!Array.isArray(json)) {
            return false;
        }
        let innerType = ARRAYS[typedef & ID_MASK];
        let length = json.length;
        for (let i = 0; i < length; i++) {
            let raw = json[i];
            if (raw == null) {
                if ((innerType & (raw === null ? NULL : UNDEFINED)) === 0) {
                    return false;
                }
                continue;
            }
            // Recurse into structural elements
            if (innerType & (ARRAY | UNION | OBJECT)) {
                if (!strict(raw, innerType, strip)) {
                    return false;
                }
                continue;
            }
            if (innerType & VALUE) {
                if (!checkValue(raw, innerType & VALUE)) {
                    return false;
                }
                continue;
            }

            return false;
        }
        return true;
    }
    if (typedef & UNION) {
        let id = typedef & ID_MASK;
        let discKey = KEY_INDEX.get(UNIONS[id]);
        if (discKey === void 0) {
            return false;
        }
        if (Array.isArray(json)) {
            return false;
        }
        let valueId = KEY_DICT.get(json[discKey]);
        let variants = DISC_UNIONS[id];
        let length = variants.length;
        for (let i = 0; i < length; i += 2) {
            if (variants[i] === valueId) {
                return strict(json, variants[i + 1], strip);
            }
        }
        return false;
    }
    if (typedef & OBJECT) {
        if (Array.isArray(json)) {
            return false;
        }
        let id = typedef & ID_MASK;
        let offset = OBJECTS[id * 2];
        let length = OBJECTS[id * 2 + 1];
        for (let i = 0; i < length; i++) {
            let key = KEY_INDEX.get(SLAB[offset + (i * 2)]);
            if (key === void 0) {
                return false;
            }
            let type = SLAB[offset + (i * 2) + 1];
            let raw = json[key];
            // null/undefined field check
            if (raw === void 0) {
                if ((type & UNDEFINED) === 0) {
                    return false;
                }
                continue;
            }
            if (raw === null) {
                if ((type & NULL) === 0) {
                    return false;
                }
                continue;
            }
            // Recurse into structural fields
            if (type & (ARRAY | UNION | OBJECT)) {
                if (!strict(raw, type, strip)) {
                    return false;
                }
                continue;
            }
            if (type & VALUE) {
                if (!checkValue(raw, type & VALUE)) {
                    return false;
                }
                continue;
            }
            return false;
        }
        // Check for unknown properties
        // We could do for (key in json), but it's slightly slower
        // And I think browsers might optimize this under the hood somehow? Leave it like this for now
        let actualKeys = Object.keys(json);
        for (let i = 0; i < actualKeys.length; i++) {
            let jsonKey = actualKeys[i];
            let keyId = KEY_DICT.get(jsonKey);
            let isKnown = false;

            if (keyId !== void 0) {
                // The key exists in our dictionary
                // Do a linear scan, most json objects have less than 100 props,
                // Possibly, for very large json objects with hundreds or thousands of properties,
                // we maybe should have a fallback and trade memory for speed.
                for (let i = 0; i < length; i++) {
                    if (SLAB[offset + (i * 2)] === keyId) {
                        isKnown = true;
                        break;
                    }
                }
            }
            if (!isKnown) {
                if (strip) {
                    delete json[actualKeys[i]];
                } else {
                    return false;
                }
            }
        }
        return true;
    }
    return check(json, typedef);
}

/** @typedef {{path: string, message: string}} */
var PathError;

/**
 * @param {*} json
 * @param {number} typedef
 * @returns {!Array<PathError>}
 */
export function diagnose(json, typedef) {
    /** @type {!Array<PathError>} */
    let errors = [];
    _diagnose(json, typedef, '', errors);
    return errors;
}

/**
 * @param {*} json
 * @param {number} typedef
 * @param {string} path
 * @param {!Array<PathError>} errors
 * @returns {void}
 */
function _diagnose(json, typedef, path, errors) {
    if (json === void 0) {
        if (!(typedef & UNDEFINED)) {
            errors.push({ path, message: 'unexpected undefined, expected ' + describeType(typedef) });
        }
        return;
    }
    if (json === null) {
        if (!(typedef & NULL)) {
            errors.push({ path, message: 'unexpected null, expected ' + describeType(typedef) });
        }
        return;
    }

    if (typedef & ARRAY) {
        if (!Array.isArray(json)) {
            errors.push({ path, message: 'expected array, got ' + typeof json });
            return;
        }
        let itemType = ARRAYS[typedef & ID_MASK];
        let n = json.length;
        for (let i = 0; i < n; i++) {
            _diagnose(json[i], itemType, path + '[' + i + ']', errors);
        }
        return;
    }

    if (typedef & UNION) {
        let id = typedef & ID_MASK;
        let discKey = KEY_INDEX.get(UNIONS[id]);
        if (discKey === void 0) {
            errors.push({ path, message: '!! CRITICAL ERROR !! Please file an issue at Github' });
            return;
        }
        if (typeof json !== 'object' || json === null || Array.isArray(json)) {
            errors.push({ path, message: 'expected object for discriminated union, got ' + typeof json });
            return;
        }
        if (!(discKey in json)) {
            errors.push({ path, message: 'missing discriminator key "' + discKey + '"' });
            return;
        }
        let valueId = KEY_DICT.get(json[discKey]);
        let arr = DISC_UNIONS[id];
        let n = arr.length;
        for (let i = 0; i < n; i += 2) {
            if (arr[i] === valueId) {
                _diagnose(json, arr[i + 1], path, errors);
                return;
            }
        }
        errors.push({ path: path + (path ? '.' : '') + discKey, message: 'unknown discriminator value "' + json[discKey] + '"' });
        return;
    }

    if (typedef & OBJECT) {
        if (typeof json !== 'object' || json === null || Array.isArray(json)) {
            errors.push({ path, message: 'expected object, got ' + typeof json });
            return;
        }
        let id = typedef & ID_MASK;
        let offset = OBJECTS[id * 2];
        let n = OBJECTS[id * 2 + 1];
        for (let i = 0; i < n; i++) {
            let key = KEY_INDEX.get(SLAB[offset + (i * 2)]);
            if (key === void 0) {
                errors.push({ path, message: '!! CRITICAL ERROR !! Please file an issue at Github' });
                return;
            }
            let type = SLAB[offset + (i * 2) + 1];
            let fieldPath = path + (path ? '.' : '') + key;
            _diagnose(json[key], type, fieldPath, errors);
        }
        return;
    }

    let valueMask = typedef & VALUE;
    if (valueMask === 0) {
        errors.push({ path, message: 'invalid type definition (no type bits set)' });
        return;
    }

    // Primitive or type union — validate the value against all allowed flags
    if (!checkValue(json, valueMask)) {
        /** @type {string} */
        let type = typeof json;
        if (type === 'object') {
            if (json instanceof Date) {
                type = 'Date';
            } else if (json instanceof URL) {
                type = 'URL';
            }
        }
        errors.push({ path, message: 'expected ' + describeType(typedef) + ', got ' + type });
    }
}