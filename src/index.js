/// <reference path="../types/types.d.ts" />

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

export const VALUE = (BOOLEAN | NUMBER | STRING | BIGINT | DATE | URI);
const PRIM_MASK = 0x0FFFFFFF;
const KIND_MASK = 0x0FFFFFFF;

// Backward-compatible aliases
export { NULLABLE as NULL, OPTIONAL as UNDEFINED };

// Complex kind enum (not bit flags)
const K_OBJECT = 0;
const K_ARRAY = 1;
const K_UNION = 2;

export const STRIP = true;
export const PLAIN = true;

const U16 = 1;
const U32 = 2;

/** @const @type {symbol} */
var FAIL = Symbol('FAIL');

// ---------------------------------------------------------------------------
// Stateless helpers (module-level — no registry state needed)
// ---------------------------------------------------------------------------

/**
 * @param {number} typedef
 * @returns {number}
 */
export function nullable(typedef) {
    return (typedef | NULLABLE) >>> 0;
}

/**
 * @param {number} typedef
 * @returns {number}
 */
export function optional(typedef) {
    return (typedef | OPTIONAL) >>> 0;
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

    let KIND_LEN = 1024;
    let KIND_COUNT = 0;
    /** @type {!Uint32Array} */
    let KINDS = new Uint32Array(KIND_LEN * 2);

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

    let V_KIND_LEN = 256;
    let V_KIND_COUNT = 0;
    /** @type {!Uint32Array} */
    let V_KINDS = new Uint32Array(V_KIND_LEN * 2);

    let needsWipe = false;

    // --- INTERNAL HELPERS ---

    /**
     * @returns {void}
     */
    function wipe() {
        V_PTR = 0;
        V_OBJ_COUNT = 0;
        V_ARR_COUNT = 0;
        V_KIND_COUNT = 0;
        V_DISC_UNIONS.length = 0;
        needsWipe = false;
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
     * @param {boolean} isVolatile
     * @returns {number}
     */
    function allocKind(complexType, registryIndex, isVolatile) {
        if (isVolatile) {
            let id = V_KIND_COUNT++;
            if (id * 2 >= V_KIND_LEN * 2) {
                let buffer = new Uint32Array((V_KIND_LEN *= 2) * 2);
                buffer.set(V_KINDS);
                V_KINDS = buffer;
            }
            V_KINDS[id * 2] = complexType;
            V_KINDS[id * 2 + 1] = registryIndex;
            return id;
        }
        let id = KIND_COUNT++;
        if (id * 2 >= KIND_LEN * 2) {
            let buffer = new Uint32Array((KIND_LEN *= 2) * 2);
            buffer.set(KINDS);
            KINDS = buffer;
        }
        KINDS[id * 2] = complexType;
        KINDS[id * 2 + 1] = registryIndex;
        return id;
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
            let isV = (type & VOLATILE) !== 0;
            let ki = type & KIND_MASK;
            let kinds = isV ? V_KINDS : KINDS;
            let ct = kinds[ki * 2];
            if (ct === K_ARRAY) parts.push('Array');
            if (ct === K_UNION) parts.push('Union');
            if (ct === K_OBJECT) parts.push('Object');
        } else {
            if (type & BOOLEAN) parts.push('boolean');
            if (type & NUMBER) parts.push('number');
            if (type & STRING) parts.push('string');
            if (type & BIGINT) parts.push('bigint');
            if (type & DATE) parts.push('Date');
            if (type & URI) parts.push('URL');
        }
        return parts.join(' | ') || 'unknown';
    }

    // --- SCHEMA BUILDERS ---

    /**
     * @throws
     * @param {!Schema} definition
     * @param {boolean} isVolatile
     * @returns {number}
     */
    function objectImpl(definition, isVolatile) {
        let keys = Object.keys(definition);
        let count = keys.length;
        let required = count * 2;
        /** @type {!Array<number>} */
        let resolvedKeys = new Array(count);
        /** @type {!Array<number>} */
        let resolvedTypes = new Array(count);
        for (let i = 0; i < count; i++) {
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
                    if (payload >= KIND_COUNT) {
                        throw new Error('Object corruption at key ' + key + '. You cannot use the bitwise OR operator (|) to combine a complex type with a primitive type');
                    }
                }
            }
            if (isObject) {
                type = objectImpl(/** @type {!Schema} */(type), isVolatile);
            }
            resolvedKeys[i] = lookup(key);
            resolvedTypes[i] = /** @type {number} */(type) >>> 0;
        }
        if (isVolatile) {
            if (V_PTR + required > V_SLAB_LEN) {
                let buffer = new Uint32Array(V_SLAB_LEN *= 2);
                buffer.set(V_SLAB);
                V_SLAB = buffer;
            }
            let offset = V_PTR;
            for (let i = 0; i < count; i++) {
                V_SLAB[offset + (i * 2)] = resolvedKeys[i];
                V_SLAB[offset + (i * 2) + 1] = resolvedTypes[i];
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
            let kindId = allocKind(K_OBJECT, id, true);
            return (COMPLEX | VOLATILE | kindId) >>> 0;
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
        for (let i = 0; i < count; i++) {
            SLAB[offset + (i * 2)] = resolvedKeys[i];
            SLAB[offset + (i * 2) + 1] = resolvedTypes[i];
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
        let kindId = allocKind(K_OBJECT, id, false);
        return (COMPLEX | kindId) >>> 0;
    }

    /**
     * @throws
     * @param {number} elemType
     * @param {boolean} isVolatile
     * @returns {number}
     */
    function arrayImpl(elemType, isVolatile) {
        if (typeof elemType !== 'number') {
            throw new Error('array element type must be a number typedef');
        }
        if (isVolatile) {
            let index = V_ARR_COUNT++;
            if (index >= V_ARR_LEN) {
                let buffer = new Uint32Array(V_ARR_LEN *= 2);
                buffer.set(V_ARRAYS);
                V_ARRAYS = buffer;
            }
            V_ARRAYS[index] = elemType >>> 0;
            let kindId = allocKind(K_ARRAY, index, true);
            return (COMPLEX | VOLATILE | kindId) >>> 0;
        }
        let index = ARR_COUNT++;
        if (index >= ARR_LEN) {
            let buffer = new Uint32Array(ARR_LEN *= 2);
            buffer.set(ARRAYS);
            ARRAYS = buffer;
        }
        ARRAYS[index] = elemType >>> 0;
        let kindId = allocKind(K_ARRAY, index, false);
        return (COMPLEX | kindId) >>> 0;
    }

    /**
     * @throws
     * @param {string} discriminator
     * @param {!IObject<string,number>} variants
     * @param {boolean} isVolatile
     * @returns {number}
     */
    function unionImpl(discriminator, variants, isVolatile) {
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
        if (isVolatile) {
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
            let kindId = allocKind(K_UNION, index, true);
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
        let kindId = allocKind(K_UNION, index, false);
        return (COMPLEX | kindId) >>> 0;
    }

    // --- VALIDATION HELPERS (closure-bound) ---

    /**
     * @param {*} raw
     * @param {number} type
     * @returns {boolean}
     */
    function _checkSlot(raw, type) {
        return (
            raw === void 0 ? (type & OPTIONAL) !== 0 :
                raw === null ? (type & NULLABLE) !== 0 :
                    (type & COMPLEX) ? _check(raw, type) :
                        (type & VALUE) ? checkValue(raw, type & PRIM_MASK) :
                            false
        );
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
            return _conformInner(raw, type, reify);
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

    // --- VALIDATION FUNCTIONS ---

    /**
     * @param {*} data
     * @param {number} typedef
     * @returns {boolean}
     */
    function _check(data, typedef) {
        if (data === void 0) {
            return (typedef & OPTIONAL) !== 0;
        }
        if (data === null) {
            return (typedef & NULLABLE) !== 0;
        }
        if (typedef & COMPLEX) {
            let isV = (typedef & VOLATILE) !== 0;
            let ki = typedef & KIND_MASK;
            let kinds = isV ? V_KINDS : KINDS;
            let ct = kinds[ki * 2];
            let ri = kinds[ki * 2 + 1];
            if (ct === K_ARRAY) {
                if (!Array.isArray(data)) {
                    return false;
                }
                let arrays = isV ? V_ARRAYS : ARRAYS;
                let innerType = arrays[ri];
                let length = data.length;
                for (let i = 0; i < length; i++) {
                    if (!_checkSlot(data[i], innerType)) {
                        return false;
                    }
                }
                return true;
            }
            if (ct === K_UNION) {
                let unions = isV ? V_UNIONS : UNIONS;
                let discUnions = isV ? V_DISC_UNIONS : DISC_UNIONS;
                let discKey = KEY_INDEX.get(unions[ri]);
                if (discKey === void 0) {
                    return false;
                }
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    return false;
                }
                let valueId = KEY_DICT.get(data[discKey]);
                let variants = discUnions[ri];
                let length = variants.length;
                for (let i = 0; i < length; i += 2) {
                    if (variants[i] === valueId) {
                        return _check(data, variants[i + 1]);
                    }
                }
                return false;
            }
            if (ct === K_OBJECT) {
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    return false;
                }
                let objects = isV ? V_OBJECTS : OBJECTS;
                let slab = isV ? V_SLAB : SLAB;
                let offset = objects[ri * 2];
                let length = objects[ri * 2 + 1];
                for (let i = 0; i < length; i++) {
                    let key = KEY_INDEX.get(slab[offset + (i * 2)]);
                    if (key === void 0) {
                        return false;
                    }
                    let type = slab[offset + (i * 2) + 1];
                    if (!_checkSlot(data[key], type)) {
                        return false;
                    }
                }
                return true;
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
     * @returns {void}
     */
    function guard(data, typedef) {
        if (!_check(data, typedef)) {
            throw diagnose(data, typedef);
        }
        needsWipe = true;
    }

    /**
     * @param {*} data
     * @param {number} typedef
     * @param {boolean=} preserve
     * @returns {boolean}
     */
    function conform(data, typedef, preserve) {
        let result = _conformInner(data, typedef, !preserve);
        needsWipe = true;
        return result;
    }

    /**
     * @param {*} data
     * @param {number} typedef
     * @param {boolean} reify
     * @returns {boolean}
     */
    function _conformInner(data, typedef, reify) {
        let nc = /*@__INLINE__*/ checkNullish(data, typedef);
        if (nc !== -1) {
            return nc === 1;
        }
        if (typedef & COMPLEX) {
            let isV = (typedef & VOLATILE) !== 0;
            let ki = typedef & KIND_MASK;
            let kinds = isV ? V_KINDS : KINDS;
            let ct = kinds[ki * 2];
            let ri = kinds[ki * 2 + 1];
            if (ct === K_ARRAY) {
                if (!Array.isArray(data)) {
                    return false;
                }
                let arrays = isV ? V_ARRAYS : ARRAYS;
                let elemType = arrays[ri];
                let length = data.length;
                for (let i = 0; i < length; i++) {
                    if (!_parseSlot(data, i, elemType, reify)) {
                        return false;
                    }
                }
                return true;
            }
            if (ct === K_UNION) {
                let unions = isV ? V_UNIONS : UNIONS;
                let discUnions = isV ? V_DISC_UNIONS : DISC_UNIONS;
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
                        return _conformInner(data, variants[i + 1], reify);
                    }
                }
                return false;
            }
            if (ct === K_OBJECT) {
                if (typeof data !== 'object' || Array.isArray(data)) {
                    return false;
                }
                let objects = isV ? V_OBJECTS : OBJECTS;
                let slab = isV ? V_SLAB : SLAB;
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
     * @param {boolean=} strip
     * @returns {boolean}
     */
    function strict(data, typedef, strip) {
        let result = _strictInner(data, typedef, strip);
        needsWipe = true;
        return result;
    }

    /**
     * @param {*} data
     * @param {number} typedef
     * @param {boolean=} strip
     * @returns {boolean}
     */
    function _strictInner(data, typedef, strip) {
        if (data == null || typeof data !== 'object') {
            return _check(data, typedef);
        }
        if (!(typedef & COMPLEX)) {
            return _check(data, typedef);
        }
        let isV = (typedef & VOLATILE) !== 0;
        let ki = typedef & KIND_MASK;
        let kinds = isV ? V_KINDS : KINDS;
        let ct = kinds[ki * 2];
        let ri = kinds[ki * 2 + 1];
        if (ct === K_ARRAY) {
            if (!Array.isArray(data)) {
                return false;
            }
            let arrays = isV ? V_ARRAYS : ARRAYS;
            let innerType = arrays[ri];
            let length = data.length;
            for (let i = 0; i < length; i++) {
                let raw = data[i];
                if (raw == null) {
                    if ((raw === null ? (innerType & NULLABLE) : (innerType & OPTIONAL)) === 0) {
                        return false;
                    }
                    continue;
                }
                if (innerType & COMPLEX) {
                    if (!_strictInner(raw, innerType, strip)) {
                        return false;
                    }
                    continue;
                }
                if (innerType & VALUE) {
                    if (!checkValue(raw, innerType & PRIM_MASK)) {
                        return false;
                    }
                    continue;
                }
                return false;
            }
            return true;
        }
        if (ct === K_UNION) {
            let unions = isV ? V_UNIONS : UNIONS;
            let discUnions = isV ? V_DISC_UNIONS : DISC_UNIONS;
            let discKey = KEY_INDEX.get(unions[ri]);
            if (discKey === void 0) {
                return false;
            }
            if (Array.isArray(data)) {
                return false;
            }
            let valueId = KEY_DICT.get(data[discKey]);
            let variants = discUnions[ri];
            let length = variants.length;
            for (let i = 0; i < length; i += 2) {
                if (variants[i] === valueId) {
                    return _strictInner(data, variants[i + 1], strip);
                }
            }
            return false;
        }
        if (ct === K_OBJECT) {
            if (Array.isArray(data)) {
                return false;
            }
            let objects = isV ? V_OBJECTS : OBJECTS;
            let slab = isV ? V_SLAB : SLAB;
            let offset = objects[ri * 2];
            let length = objects[ri * 2 + 1];
            for (let i = 0; i < length; i++) {
                let key = KEY_INDEX.get(slab[offset + (i * 2)]);
                if (key === void 0) {
                    return false;
                }
                let type = slab[offset + (i * 2) + 1];
                let raw = data[key];
                if (raw == null) {
                    if ((raw === null ? (type & NULLABLE) : (type & OPTIONAL)) === 0) {
                        return false;
                    }
                    continue;
                }
                if (type & COMPLEX) {
                    if (!_strictInner(raw, type, strip)) {
                        return false;
                    }
                    continue;
                }
                if (type & VALUE) {
                    if (!checkValue(raw, type & PRIM_MASK)) {
                        return false;
                    }
                    continue;
                }
                return false;
            }
            let actualKeys = Object.keys(data);
            for (let i = 0; i < actualKeys.length; i++) {
                let dataKey = actualKeys[i];
                let keyId = KEY_DICT.get(dataKey);
                let isKnown = false;
                if (keyId !== void 0) {
                    for (let i = 0; i < length; i++) {
                        if (slab[offset + (i * 2)] === keyId) {
                            isKnown = true;
                            break;
                        }
                    }
                }
                if (!isKnown) {
                    if (strip) {
                        delete data[actualKeys[i]];
                    } else {
                        return false;
                    }
                }
            }
            return true;
        }
        return false;
    }

    // --- DIAGNOSTICS ---

    /** @typedef {{path: string, message: string}} */
    var PathError;

    /**
     * @param {*} data
     * @param {number} typedef
     * @returns {!Array<PathError>}
     */
    function diagnose(data, typedef) {
        /** @type {!Array<PathError>} */
        let errors = [];
        _diagnose(data, typedef, '', errors);
        needsWipe = true;
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
            let isV = (typedef & VOLATILE) !== 0;
            let ki = typedef & KIND_MASK;
            let kinds = isV ? V_KINDS : KINDS;
            let ct = kinds[ki * 2];
            let ri = kinds[ki * 2 + 1];
            if (ct === K_ARRAY) {
                if (!Array.isArray(data)) {
                    errors.push({ path, message: 'expected array, got ' + typeof data });
                    return;
                }
                let arrays = isV ? V_ARRAYS : ARRAYS;
                let itemType = arrays[ri];
                let length = data.length;
                for (let i = 0; i < length; i++) {
                    _diagnose(data[i], itemType, path + '[' + i + ']', errors);
                }
                return;
            }
            if (ct === K_UNION) {
                let unions = isV ? V_UNIONS : UNIONS;
                let discUnions = isV ? V_DISC_UNIONS : DISC_UNIONS;
                let discKey = KEY_INDEX.get(unions[ri]);
                if (discKey === void 0) {
                    errors.push({ path, message: '!! CRITICAL ERROR !! Please file an issue at Github' });
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
                let objects = isV ? V_OBJECTS : OBJECTS;
                let slab = isV ? V_SLAB : SLAB;
                let offset = objects[ri * 2];
                let length = objects[ri * 2 + 1];
                for (let i = 0; i < length; i++) {
                    let key = KEY_INDEX.get(slab[offset + (i * 2)]);
                    if (key === void 0) {
                        errors.push({ path, message: '!! CRITICAL ERROR !! Please file an issue at Github' });
                        return;
                    }
                    let type = slab[offset + (i * 2) + 1];
                    let fieldPath = path + (path ? '.' : '') + key;
                    _diagnose(data[key], type, fieldPath, errors);
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
     * @returns {boolean}
     */
    function check(data, typedef) {
        let result = _check(data, typedef);
        needsWipe = true;
        return result;
    }

    // --- API OBJECTS ---

    const t = {
        object: (def) => objectImpl(def, false),
        array: (type) => arrayImpl(type, false),
        union: (disc, variants) => unionImpl(disc, variants, false),
    };

    const v = {
        object: (def) => {
            if (needsWipe) {
                wipe();
            }
            return objectImpl(def, true);
        },
        array: (type) => {
            if (needsWipe) {
                wipe();
            }
            return arrayImpl(type, true);
        },
        union: (disc, variants) => {
            if (needsWipe) {
                wipe();
            }
            return unionImpl(disc, variants, true);
        },
    };

    return { t, v, check, guard, conform, strict, diagnose };
}

// ---------------------------------------------------------------------------
// Default instance and backward-compatible exports
// ---------------------------------------------------------------------------

const _default = registry();

// New API
export const t = _default.t;
export const v = _default.v;
export { registry };

// Backward compat
export const object = _default.t.object;
export const array = _default.t.array;
export const union = _default.t.union;
export const check = _default.check;
export const guard = _default.guard;
export const conform = _default.conform;
export const strict = _default.strict;
export const diagnose = _default.diagnose;
