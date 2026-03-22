/// <reference path="../../global.d.ts" />
import { config, heap } from './config.js';
import {
    COMPLEX, NULLABLE, OPTIONAL, SCRATCH,
    ANY, NEVER, SIMPLE, PRIM_MASK, KIND_MASK,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_UNION,
    K_REFINE, K_TUPLE, K_RECORD, K_OR, K_EXCLUSIVE,
    K_INTERSECT, K_NOT, K_CONDITIONAL,
    KIND_ENUM_MASK, HAS_VALIDATOR,
    V_STR_MIN_LEN, V_STR_MAX_LEN, V_STR_PATTERN, V_STR_FORMAT,
    V_NUM_MIN, V_NUM_MAX, V_NUM_MULTIPLE, V_NUM_EX_MIN, V_NUM_EX_MAX,
    V_ARR_MIN, V_ARR_MAX, V_ARR_CONTAINS, V_ARR_MIN_CT, V_ARR_MAX_CT,
    V_ARR_UNIQUE, V_OBJ_MIN, V_OBJ_MAX, V_OBJ_PAT_PROP, V_OBJ_PROP_NAM,
    V_OBJ_NO_ADD, V_OBJ_DEP_REQ,
    popcnt16,
    FMT_EMAIL, FMT_IPV4, FMT_UUID, FMT_DATETIME,
    FMT_RE_EMAIL, FMT_RE_IPV4, FMT_RE_UUID, FMT_RE_DATETIME,
    NOT_STRICT, STRICT_REJECT, STRICT_DELETE, STRICT_PROTO,
    STRICT_MODE_MASK, FAIL, codepointLen, hasOwnProperty, toString
} from './const.js';
import {
    sortByKeyId, parseValue, _isValue, describeType
} from './util.js';

/**
 * @template {symbol} R
 * @param {uvd.Config=} cfg 
 * @returns {uvd.Catalog<R>}
 */
function catalog(cfg) {
    cfg = config(cfg);
    let HEAP = heap(cfg.heap);
    let SCR_HEAP = heap(cfg.scratch);

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

    // Scratch heap store
    let S_SLAB = SCR_HEAP.SLAB;
    let S_OBJECTS = SCR_HEAP.OBJECTS;
    let S_ARRAYS = SCR_HEAP.ARRAYS;
    let S_UNIONS = SCR_HEAP.UNIONS;
    let S_TUPLES = SCR_HEAP.TUPLES;
    let S_MATCHES = SCR_HEAP.MATCHES;
    let S_KINDS = SCR_HEAP.KINDS;
    let S_VALIDATORS = SCR_HEAP.VALIDATORS;
    let S_REGEX_CACHE = SCR_HEAP.REGEX_CACHE;
    let S_CALLBACKS = SCR_HEAP.CALLBACKS;

    // --- KEY DICTIONARY (shared between permanent and scratch) ---
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
    function rewindScratch() {
        SCR_HEAP.PTR = 0;
        SCR_HEAP.OBJ_COUNT = 0;
        SCR_HEAP.ARR_COUNT = 0;
        SCR_HEAP.TUP_COUNT = 0;
        SCR_HEAP.MAT_COUNT = 0;
        SCR_HEAP.UNION_COUNT = 0;
        SCR_HEAP.KIND_PTR = 0;
        SCR_HEAP.VAL_PTR = 0;
        S_REGEX_CACHE.length = 0;
        S_CALLBACKS.length = 0;
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
     * @param {boolean} scratch
     * @param {number} slots
     * @returns {number}
     */
    function allocKind(header, registryIndex, scratch, slots) {
        if (scratch) {
            let ptr = SCR_HEAP.KIND_PTR;
            if (ptr + slots > SCR_HEAP.KIND_LEN) {
                let buffer = new Uint32Array(SCR_HEAP.KIND_LEN *= 2);
                buffer.set(S_KINDS);
                SCR_HEAP.KINDS = S_KINDS = buffer;
            }
            S_KINDS[ptr] = header;
            S_KINDS[ptr + 1] = registryIndex;
            SCR_HEAP.KIND_PTR += slots;
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
     * @param {boolean} scratch
     * @returns {number}
     */
    function allocValidator(vHeader, payloads, scratch) {
        let needed = 1 + payloads.length;
        if (scratch) {
            if (SCR_HEAP.VAL_PTR + needed > SCR_HEAP.VAL_LEN) {
                let buffer = new Float64Array(SCR_HEAP.VAL_LEN *= 2);
                buffer.set(S_VALIDATORS);
                SCR_HEAP.VALIDATORS = S_VALIDATORS = buffer;
            }
            let ptr = SCR_HEAP.VAL_PTR;
            S_VALIDATORS[ptr] = vHeader;
            for (let i = 0; i < payloads.length; i++) {
                S_VALIDATORS[ptr + 1 + i] = payloads[i];
            }
            SCR_HEAP.VAL_PTR += needed;
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
     * Allocate entries on the SLAB and register in a typed registry (TUPLES or MATCHES).
     * @param {!Array<number>} types
     * @param {boolean} scratch
     * @param {string} kind - 'tuple' or 'match'
     * @returns {number} registry index
     */
    function allocOnSlab(types, scratch, kind) {
        let count = types.length;
        let heap = scratch ? SCR_HEAP : HEAP;
        let slab = scratch ? S_SLAB : SLAB;
        let ptr = heap.PTR;

        // Grow slab if needed
        if (scratch) {
            if (ptr + count > SCR_HEAP.SLAB_LEN) {
                let buffer = new Uint32Array(SCR_HEAP.SLAB_LEN *= 2);
                buffer.set(S_SLAB);
                SCR_HEAP.SLAB = S_SLAB = buffer;
                slab = S_SLAB;
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
            let tuples = scratch ? S_TUPLES : TUPLES;
            let id = heap.TUP_COUNT++;

            if ((id + 1) * 3 > heap.TUP_LEN) {
                if (scratch) {
                    let buffer = new Uint32Array(SCR_HEAP.TUP_LEN *= 2);
                    buffer.set(S_TUPLES);
                    SCR_HEAP.TUPLES = S_TUPLES = buffer;
                    tuples = S_TUPLES;
                } else {
                    let buffer = new Uint32Array(HEAP.TUP_LEN *= 2);
                    buffer.set(TUPLES);
                    HEAP.TUPLES = TUPLES = buffer;
                    tuples = TUPLES;
                }
            }

            tuples[id * 3] = offset;
            tuples[id * 3 + 1] = count;
            tuples[id * 3 + 2] = NEVER; // exact length (programmatic API default)
            return id;
        }

        // kind === 'match'
        let matches = scratch ? S_MATCHES : MATCHES;
        let id = heap.MAT_COUNT++;

        if ((id + 1) * 2 > heap.MAT_LEN) {
            if (scratch) {
                let buffer = new Uint32Array(SCR_HEAP.MAT_LEN *= 2);
                buffer.set(S_MATCHES);
                SCR_HEAP.MATCHES = S_MATCHES = buffer;
                matches = S_MATCHES;
            } else {
                let buffer = new Uint32Array(HEAP.MAT_LEN *= 2);
                buffer.set(MATCHES);
                HEAP.MATCHES = MATCHES = buffer;
                matches = MATCHES;
            }
        }

        matches[id * 2] = offset;
        matches[id * 2 + 1] = count;
        return id;
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
            if (result === FAIL) {
                return false;
            }
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
        if (typedef & ANY) {
            return true;
        }
        if (data == null) {
            return (data === null ? (typedef & NULLABLE) : (typedef & OPTIONAL)) !== 0;
        }
        if (typedef & COMPLEX) {
            let scratch = (typedef & SCRATCH) !== 0;
            let ptr = typedef & KIND_MASK;
            let kinds = scratch ? S_KINDS : KINDS;
            let header = kinds[ptr];
            let ct = header & KIND_ENUM_MASK;
            let ri = kinds[ptr + 1];
            if (ct === K_PRIMITIVE) {
                return _isValue(data, header & SIMPLE);
            }
            if (ct === K_ARRAY) {
                if (!Array.isArray(data)) {
                    return false;
                }
                let arrays = scratch ? S_ARRAYS : ARRAYS;
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
                    if (innerType & SIMPLE) {
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
                let objects = scratch ? S_OBJECTS : OBJECTS;
                let slab = scratch ? S_SLAB : SLAB;
                let offset = objects[ri * 3];
                let length = objects[ri * 3 + 1];
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
                    if (type & SIMPLE) {
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
                        if (!hasOwnProperty.call(data, key)) {
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
                let unions = scratch ? S_UNIONS : UNIONS;
                let slab = scratch ? S_SLAB : SLAB;
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
                let tuples = scratch ? S_TUPLES : TUPLES;
                let slab = scratch ? S_SLAB : SLAB;
                let offset = tuples[ri * 3];
                let length = tuples[ri * 3 + 1];
                let restType = tuples[ri * 3 + 2];
                if (data.length < length) {
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
                    if (elemType & SIMPLE) {
                        if (!_isValue(item, elemType & PRIM_MASK)) {
                            return false;
                        }
                        continue;
                    }
                    return false;
                }
                if (restType !== 0) {
                    for (let i = length; i < data.length; i++) {
                        if (!_is(data[i], restType, strict)) {
                            return false;
                        }
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
                    if (valueType & SIMPLE) {
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
                let matches = scratch ? S_MATCHES : MATCHES;
                let slab = scratch ? S_SLAB : SLAB;
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
                let matches = scratch ? S_MATCHES : MATCHES;
                let slab = scratch ? S_SLAB : SLAB;
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
                let matches = scratch ? S_MATCHES : MATCHES;
                let slab = scratch ? S_SLAB : SLAB;
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
                let matches = scratch ? S_MATCHES : MATCHES;
                let slab = scratch ? S_SLAB : SLAB;
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
     * @template T
     * @param {*} data
     * @param {uvd.Type<T,R>} typedef
     * @param {boolean=} preserve
     * @returns {data is T}
     */
    function conform(data, typedef, preserve) {
        if (typeof typedef !== 'number') {
            return false;
        }
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
        if (typedef & ANY) return true;
        if (data == null) {
            return (data === null ? (typedef & NULLABLE) : (typedef & OPTIONAL)) !== 0;
        }
        if (typedef & COMPLEX) {
            let scratch = (typedef & SCRATCH) !== 0;
            let ptr = typedef & KIND_MASK;
            let kinds = scratch ? S_KINDS : KINDS;
            let header = kinds[ptr];
            let ct = header & KIND_ENUM_MASK;
            let ri = kinds[ptr + 1];
            if (ct === K_PRIMITIVE) {
                let vm = header & SIMPLE;
                return vm !== 0 && parseValue(data, vm, reify) !== FAIL;
            }
            if (ct === K_ARRAY) {
                if (!Array.isArray(data)) {
                    return false;
                }
                let arrays = scratch ? S_ARRAYS : ARRAYS;
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
                let objects = scratch ? S_OBJECTS : OBJECTS;
                let slab = scratch ? S_SLAB : SLAB;
                let offset = objects[ri * 3];
                let length = objects[ri * 3 + 1];
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
                let unions = scratch ? S_UNIONS : UNIONS;
                let slab = scratch ? S_SLAB : SLAB;
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
                let tuples = scratch ? S_TUPLES : TUPLES;
                let slab = scratch ? S_SLAB : SLAB;
                let offset = tuples[ri * 3];
                let length = tuples[ri * 3 + 1];
                let restType = tuples[ri * 3 + 2];
                if (data.length < length) {
                    return false;
                }
                for (let i = 0; i < length; i++) {
                    if (!_parseSlot(data, i, slab[offset + i], reify)) {
                        return false;
                    }
                }
                if (restType !== 0) {
                    for (let i = length; i < data.length; i++) {
                        if (!_parseSlot(data, i, restType, reify)) {
                            return false;
                        }
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
                let matches = scratch ? S_MATCHES : MATCHES;
                let slab = scratch ? S_SLAB : SLAB;
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
                let matches = scratch ? S_MATCHES : MATCHES;
                let slab = scratch ? S_SLAB : SLAB;
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
                let matches = scratch ? S_MATCHES : MATCHES;
                let slab = scratch ? S_SLAB : SLAB;
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
                let matches = scratch ? S_MATCHES : MATCHES;
                let slab = scratch ? S_SLAB : SLAB;
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
     * @returns {!Array<uvd.PathError>}
     */
    function diagnose(data, typedef) {
        rewindPending = true;
        /** @type {!Array<uvd.PathError>} */
        let errors = [];
        _diagnose(data, typedef, '', errors);
        return errors;
    }

    /**
     * @param {*} data
     * @param {number} typedef
     * @param {string} path
     * @param {!Array<uvd.PathError>} errors
     * @returns {void}
     */
    function _diagnose(data, typedef, path, errors) {
        const kinds = (typedef & SCRATCH) === 0 ? KINDS : S_KINDS;
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
            let scratch = (typedef & SCRATCH) !== 0;
            let ptr = typedef & KIND_MASK;
            let kinds = scratch ? S_KINDS : KINDS;
            let header = kinds[ptr];
            let ct = header & KIND_ENUM_MASK;
            let ri = kinds[ptr + 1];
            if (ct === K_PRIMITIVE) {
                let primBits = header & SIMPLE;
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
                let arrays = scratch ? S_ARRAYS : ARRAYS;
                let itemType = arrays[ri];
                let length = data.length;
                for (let i = 0; i < length; i++) {
                    _diagnose(data[i], itemType, path + '[' + i + ']', errors);
                }
                return;
            }
            if (ct === K_UNION) {
                let unions = scratch ? S_UNIONS : UNIONS;
                let slab = scratch ? S_SLAB : SLAB;
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
                let objects = scratch ? S_OBJECTS : OBJECTS;
                let slab = scratch ? S_SLAB : SLAB;
                let offset = objects[ri * 3];
                let length = objects[ri * 3 + 1];
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
                let tuples = scratch ? S_TUPLES : TUPLES;
                let slab = scratch ? S_SLAB : SLAB;
                let offset = tuples[ri * 3];
                let length = tuples[ri * 3 + 1];
                let restType = tuples[ri * 3 + 2];
                if (data.length < length) {
                    errors.push({ path, message: 'expected tuple of length >= ' + length + ', got length ' + data.length });
                    return;
                }
                for (let i = 0; i < length; i++) {
                    _diagnose(data[i], slab[offset + i], path + '[' + i + ']', errors);
                }
                if (restType !== 0) {
                    for (let i = length; i < data.length; i++) {
                        _diagnose(data[i], restType, path + '[' + i + ']', errors);
                    }
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
                let matches = scratch ? S_MATCHES : MATCHES;
                let slab = scratch ? S_SLAB : SLAB;
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
                let matches = scratch ? S_MATCHES : MATCHES;
                let slab = scratch ? S_SLAB : SLAB;
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
                let matches = scratch ? S_MATCHES : MATCHES;
                let slab = scratch ? S_SLAB : SLAB;
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
                let matches = scratch ? S_MATCHES : MATCHES;
                let slab = scratch ? S_SLAB : SLAB;
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
     * @template T
     * @param {*} data
     * @param {uvd.Type<T,R>} typedef
     * @param {number=} strict
     * @returns {data is T}
     */
    function is(data, typedef, strict) {
        if (typeof typedef !== 'number') {
            return false;
        }
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
     * @param {boolean} scratch
     * @returns {boolean}
     */
    function runPrimValidator(value, primBits, valIdx, scratch) {
        let vals = scratch ? S_VALIDATORS : VALIDATORS;
        let vHeader = vals[valIdx] | 0;
        let base = valIdx + 1;
        if (typeof value === 'string') {
            if (vHeader & V_STR_MIN_LEN) {
                let p = base + popcnt16(vHeader & (V_STR_MIN_LEN - 1));
                if (codepointLen(value) < vals[p]) {
                    return false;
                }
            }
            if (vHeader & V_STR_MAX_LEN) {
                let p = base + popcnt16(vHeader & (V_STR_MAX_LEN - 1));
                if (codepointLen(value) > vals[p]) {
                    return false;
                }
            }
            if (vHeader & V_STR_PATTERN) {
                let p = base + popcnt16(vHeader & (V_STR_PATTERN - 1));
                let regexCache = scratch ? S_REGEX_CACHE : REGEX_CACHE;
                if (!regexCache[vals[p] | 0].test(value)) {
                    return false;
                }
            }
            if (vHeader & V_STR_FORMAT) {
                let p = base + popcnt16(vHeader & (V_STR_FORMAT - 1));
                let fmt = vals[p] | 0;
                let re = fmt === FMT_EMAIL ? FMT_RE_EMAIL :
                    fmt === FMT_IPV4 ? FMT_RE_IPV4 :
                        fmt === FMT_UUID ? FMT_RE_UUID :
                            fmt === FMT_DATETIME ? FMT_RE_DATETIME : null;
                if (re && !re.test(value)) {
                    return false;
                }
            }
        } else if (typeof value === 'number') {
            if (vHeader & V_NUM_MIN) {
                let p = base + popcnt16(vHeader & (V_NUM_MIN - 1));
                if ((vHeader & V_NUM_EX_MIN) ? value <= vals[p] : value < vals[p]) {
                    return false;
                }
            }
            if (vHeader & V_NUM_MAX) {
                let p = base + popcnt16(vHeader & (V_NUM_MAX - 1));
                if ((vHeader & V_NUM_EX_MAX) ? value >= vals[p] : value > vals[p]) {
                    return false;
                }
            }
            if (vHeader & V_NUM_MULTIPLE) {
                let p = base + popcnt16(vHeader & (V_NUM_MULTIPLE - 1));
                let quotient = value / vals[p];
                let isMultiple = Math.abs(Math.round(quotient) - quotient) < 1e-8;
                if (!isMultiple) {
                    return false;
                }
            }
        } else if (Array.isArray(value)) {
            if (vHeader & V_ARR_MIN) {
                let p = base + popcnt16(vHeader & (V_ARR_MIN - 1));
                if (value.length < vals[p]) {
                    return false;
                }
            }
            if (vHeader & V_ARR_MAX) {
                let p = base + popcnt16(vHeader & (V_ARR_MAX - 1));
                if (value.length > vals[p]) {
                    return false;
                }
            }
            if (vHeader & V_ARR_UNIQUE) {
                let seen = new Set();
                for (let i = 0; i < value.length; i++) {
                    let key = typeof value[i] === 'object' ? JSON.stringify(value[i]) : value[i];
                    if (seen.has(key)) {
                        return false;
                    }
                    seen.add(key);
                }
            }
        } else if (toString.call(value) === '[object Object]') {
            if (vHeader & V_OBJ_MIN) {
                let p = base + popcnt16(vHeader & (V_OBJ_MIN - 1));
                if (Object.keys(value).length < vals[p]) {
                    return false;
                }
            }
            if (vHeader & V_OBJ_MAX) {
                let p = base + popcnt16(vHeader & (V_OBJ_MAX - 1));
                if (Object.keys(value).length > vals[p]) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * @param {!Array<*>} data
     * @param {number} valIdx
     * @param {boolean} scratch
     * @returns {boolean}
     */
    function runArrayValidator(data, valIdx, scratch) {
        let vals = scratch ? S_VALIDATORS : VALIDATORS;
        let vHeader = vals[valIdx] | 0;
        let base = valIdx + 1;
        if (vHeader & V_ARR_MIN) {
            let p = base + popcnt16(vHeader & (V_ARR_MIN - 1));
            if (data.length < vals[p]) {
                return false;
            }
        }
        if (vHeader & V_ARR_MAX) {
            let p = base + popcnt16(vHeader & (V_ARR_MAX - 1));
            if (data.length > vals[p]) {
                return false;
            }
        }
        if (vHeader & V_ARR_UNIQUE) {
            let set = new Set(data);
            if (set.size !== data.length) {
                return false;
            }
        }
        if (vHeader & V_ARR_CONTAINS) {
            let cp = base + popcnt16(vHeader & (V_ARR_CONTAINS - 1));
            let containsType = vals[cp] >>> 0;
            let minC = (vHeader & V_ARR_MIN_CT) ? vals[base + popcnt16(vHeader & (V_ARR_MIN_CT - 1))] : 1;
            let maxC = (vHeader & V_ARR_MAX_CT) ? vals[base + popcnt16(vHeader & (V_ARR_MAX_CT - 1))] : Infinity;
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
        }
        return true;
    }

    /**
     * @param {!Record<string,any>} data
     * @param {number} valIdx
     * @param {boolean} scratch
     * @param {number} ri
     * @returns {boolean}
     */
    function runObjectValidator(data, valIdx, scratch, ri) {
        let vals = scratch ? S_VALIDATORS : VALIDATORS;
        let regexCache = scratch ? S_REGEX_CACHE : REGEX_CACHE;
        let vHeader = vals[valIdx] | 0;
        let p = valIdx + 1;
        let keys = Object.keys(data);
        let keyCount = keys.length;
        if (vHeader & V_OBJ_MIN) {
            if (keyCount < vals[p++]) {
                return false;
            }
        }
        if (vHeader & V_OBJ_MAX) {
            if (keyCount > vals[p++]) {
                return false;
            }
        }
        if (vHeader & V_OBJ_PAT_PROP) {
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
        if (vHeader & V_OBJ_PROP_NAM) {
            let nameSchema = vals[p++] >>> 0;
            for (let ki = 0; ki < keyCount; ki++) {
                if (!_validate(keys[ki], nameSchema)) {
                    return false;
                }
            }
        }
        if (vHeader & V_OBJ_DEP_REQ) {
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
        if (vHeader & V_OBJ_NO_ADD) {
            let objects = scratch ? S_OBJECTS : OBJECTS;
            let slab = scratch ? S_SLAB : SLAB;
            let offset = objects[ri * 3];
            let length = objects[ri * 3 + 1];
            let addType = objects[ri * 3 + 2];
            for (let ki = 0; ki < keyCount; ki++) {
                let keyId = KEY_DICT.get(keys[ki]);
                let declared = false;
                if (keyId !== void 0) {
                    let lo = 0;
                    let hi = length - 1;
                    while (lo <= hi) {
                        let mid = (lo + hi) >>> 1;
                        let sk = slab[offset + (mid << 1)];
                        if (sk === keyId) {
                            declared = true;
                            break;
                        }
                        if (sk < keyId) {
                            lo = mid + 1;
                        } else {
                            hi = mid - 1;
                        }
                    }
                }
                if (!declared) {
                    // Check if matched by patternProperties
                    let patternMatched = false;
                    if (vHeader & V_OBJ_PAT_PROP) {
                        // Scan pattern entries — they were already validated above,
                        // but we need to know if this key matched any pattern
                        let pp = valIdx + 1;
                        if (vHeader & V_OBJ_MIN) pp++;
                        if (vHeader & V_OBJ_MAX) pp++;
                        let patternCount = vals[pp++] | 0;
                        for (let pi = 0; pi < patternCount; pi++) {
                            let reIdx = vals[pp++] | 0;
                            pp++; // skip schemaType
                            if (regexCache[reIdx].test(keys[ki])) {
                                patternMatched = true;
                                break;
                            }
                        }
                    }
                    if (!patternMatched) {
                        if (addType === 0) {
                            return false;
                        }
                        if (!_validate(data[keys[ki]], addType)) {
                            return false;
                        }
                    }
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
                        (type & SIMPLE) ? _isValue(raw, type & PRIM_MASK) :
                            false
        );
    }

    /**
     * @param {*} data
     * @param {number} typedef
     * @returns {boolean}
     */
    function _validate(data, typedef) {
        if (typedef & ANY) return true;
        if (data == null) {
            let nullBit = data === null ? NULLABLE : OPTIONAL;
            if (typedef & nullBit) return true;
            // For non-COMPLEX types, null/undefined is a mismatch
            if (!(typedef & COMPLEX)) return false;
            // COMPLEX types: fall through to kind handler (needed for K_CONDITIONAL)
        }
        if (typedef & COMPLEX) {
            let scratch = (typedef & SCRATCH) !== 0;
            let ptr = typedef & KIND_MASK;
            let kinds = scratch ? S_KINDS : KINDS;
            let header = kinds[ptr];
            let ct = header & KIND_ENUM_MASK;
            let ri = kinds[ptr + 1];
            if (ct === K_PRIMITIVE) {
                let primBits = header & SIMPLE;
                if (!_isValue(data, primBits)) {
                    return false;
                }
                if (header & HAS_VALIDATOR) {
                    return runPrimValidator(data, primBits, ri, scratch);
                }
                return true;
            }
            if (ct === K_ARRAY) {
                if (!Array.isArray(data)) return false;
                let arrays = scratch ? S_ARRAYS : ARRAYS;
                let innerType = arrays[ri];
                let length = data.length;
                for (let i = 0; i < length; i++) {
                    if (!_validateSlot(data[i], innerType)) return false;
                }
                if (header & HAS_VALIDATOR) {
                    return runArrayValidator(data, kinds[ptr + 2], scratch);
                }
                return true;
            }
            if (ct === K_UNION) {
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    return false;
                }
                let unions = scratch ? S_UNIONS : UNIONS;
                let slab = scratch ? S_SLAB : SLAB;
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
                let objects = scratch ? S_OBJECTS : OBJECTS;
                let slab = scratch ? S_SLAB : SLAB;
                let offset = objects[ri * 3];
                let length = objects[ri * 3 + 1];
                for (let i = 0; i < length; i++) {
                    let key = KEY_INDEX.get(slab[offset + (i * 2)]);
                    if (key === void 0) {
                        return false;
                    }
                    let type = slab[offset + (i * 2) + 1];
                    let val = data[key];

                    // 2. THE GUARD: Only pay the 'hasOwnProperty' tax if it looks like a prototype leak!
                    if (val !== void 0 && (typeof val === 'function' || key === '__proto__')) {
                        // We only execute this slow code 0.001% of the time.
                        if (!hasOwnProperty.call(data, key)) {
                            val = void 0;
                        }
                    }
                    if (!_validateSlot(val, type)) {
                        return false;
                    }
                }
                if (header & HAS_VALIDATOR) {
                    return runObjectValidator(data, kinds[ptr + 2], scratch, ri);
                }
                return true;
            }
            if (ct === K_REFINE) {
                if (!_validate(data, ri)) {
                    return false;
                }
                let callbacks = scratch ? S_CALLBACKS : CALLBACKS;
                return !!callbacks[kinds[ptr + 2]](data);
            }
            if (ct === K_TUPLE) {
                if (!Array.isArray(data)) {
                    return false;
                }
                let tuples = scratch ? S_TUPLES : TUPLES;
                let slab = scratch ? S_SLAB : SLAB;
                let offset = tuples[ri * 3];
                let length = tuples[ri * 3 + 1];
                let restType = tuples[ri * 3 + 2];
                if (data.length < length) {
                    return false;
                }
                for (let i = 0; i < length; i++) {
                    if (!_validateSlot(data[i], slab[offset + i])) {
                        return false;
                    }
                }
                if (restType !== 0) {
                    for (let i = length; i < data.length; i++) {
                        if (!_validateSlot(data[i], restType)) {
                            return false;
                        }
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
                let matches = scratch ? S_MATCHES : MATCHES;
                let slab = scratch ? S_SLAB : SLAB;
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
                let matches = scratch ? S_MATCHES : MATCHES;
                let slab = scratch ? S_SLAB : SLAB;
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
                let matches = scratch ? S_MATCHES : MATCHES;
                let slab = scratch ? S_SLAB : SLAB;
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
                let matches = scratch ? S_MATCHES : MATCHES;
                let slab = scratch ? S_SLAB : SLAB;
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
     * @template T
     * @param {*} data
     * @param {uvd.Type<T,R>} typedef
     * @returns {data is T}
     */
    function validate(data, typedef) {
        if (typeof typedef !== 'number') {
            return false;
        }
        rewindPending = true;
        let result = _validate(data, typedef);
        return result;
    }

    /**
     * Writes pre-resolved [keyId, typedef, ...] pairs to SLAB, registers in OBJECTS.
     * @param {!Array<number>} resolved - sorted [keyId, typedef] pairs
     * @param {number} count - number of properties (resolved.length / 2)
     * @param {boolean} scratch
     * @param {number} additionalType
     * @returns {number} object registry id
     */
    function registerObject(resolved, count, scratch, additionalType) {
        let required = count * 2;
        let addType = additionalType !== void 0 ? additionalType : 0;
        if (scratch) {
            if (SCR_HEAP.PTR + required > SCR_HEAP.SLAB_LEN) {
                let buffer = new Uint32Array(SCR_HEAP.SLAB_LEN *= 2);
                buffer.set(S_SLAB);
                SCR_HEAP.SLAB = S_SLAB = buffer;
            }
            let offset = SCR_HEAP.PTR;
            for (let i = 0; i < required; i++) {
                S_SLAB[offset + i] = resolved[i];
            }
            if ((SCR_HEAP.OBJ_COUNT + 1) * 3 > SCR_HEAP.OBJ_LEN) {
                let buffer = new Uint32Array(SCR_HEAP.OBJ_LEN *= 2);
                buffer.set(S_OBJECTS);
                SCR_HEAP.OBJECTS = S_OBJECTS = buffer;
            }
            let id = SCR_HEAP.OBJ_COUNT++;
            S_OBJECTS[id * 3] = offset;
            S_OBJECTS[id * 3 + 1] = count;
            S_OBJECTS[id * 3 + 2] = addType;
            SCR_HEAP.PTR += required;
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
        if ((HEAP.OBJ_COUNT + 1) * 3 > HEAP.OBJ_LEN) {
            let buffer = new Uint32Array(HEAP.OBJ_LEN *= 2);
            buffer.set(OBJECTS);
            HEAP.OBJECTS = OBJECTS = buffer;
        }
        let id = HEAP.OBJ_COUNT++;
        OBJECTS[id * 3] = offset;
        OBJECTS[id * 3 + 1] = count;
        OBJECTS[id * 3 + 2] = addType;
        HEAP.PTR += required;
        return id;
    }

    /**
     * Registers an element type in ARRAYS.
     * @param {number} elemType
     * @param {boolean} scratch
     * @returns {number} array registry id
     */
    function registerArray(elemType, scratch) {
        if (scratch) {
            let index = SCR_HEAP.ARR_COUNT++;
            if (index >= SCR_HEAP.ARR_LEN) {
                let buffer = new Uint32Array(SCR_HEAP.ARR_LEN *= 2);
                buffer.set(S_ARRAYS);
                SCR_HEAP.ARRAYS = S_ARRAYS = buffer;
            }
            S_ARRAYS[index] = elemType >>> 0;
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
     * @param {boolean} scratch
     * @returns {number} union registry id
     */
    function registerUnion(resolved, count, discKeyId, scratch) {
        let required = count * 2;
        if (scratch) {
            if (SCR_HEAP.PTR + required > SCR_HEAP.SLAB_LEN) {
                let buffer = new Uint32Array(SCR_HEAP.SLAB_LEN *= 2);
                buffer.set(S_SLAB);
                SCR_HEAP.SLAB = S_SLAB = buffer;
            }
            let offset = SCR_HEAP.PTR;
            for (let i = 0; i < required; i++) {
                S_SLAB[offset + i] = resolved[i];
            }
            SCR_HEAP.PTR += required;
            let id = SCR_HEAP.UNION_COUNT++;
            if ((id + 1) * 3 > SCR_HEAP.UNION_LEN) {
                let buffer = new Uint32Array(SCR_HEAP.UNION_LEN *= 2);
                buffer.set(S_UNIONS);
                SCR_HEAP.UNIONS = S_UNIONS = buffer;
            }
            S_UNIONS[id * 3] = offset;
            S_UNIONS[id * 3 + 1] = count;
            S_UNIONS[id * 3 + 2] = discKeyId;
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

    let DICT = {
        KEY_DICT,
        KEY_INDEX,
    };

    return {
        is, guard, conform, validate, diagnose, __heap: {
            HEAP, SCR_HEAP, DICT,
            REGEX_CACHE, CALLBACKS, S_REGEX_CACHE, S_CALLBACKS,
            allocKind, allocValidator, allocOnSlab, lookup,
            registerObject, registerArray, registerUnion,
            rewindPending() { return rewindPending; },
            rewind() { rewindScratch(); },
        }
    };
}

export {
    catalog, sortByKeyId,
    COMPLEX, NULLABLE, OPTIONAL, SCRATCH,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_UNION, K_REFINE, K_TUPLE,
    K_RECORD, K_OR, K_EXCLUSIVE, K_INTERSECT, K_NOT, K_CONDITIONAL,
    HAS_VALIDATOR,
};

export * from './const.js';
