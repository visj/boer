/// <reference path="../../global.d.ts" />
import { config, heap } from './config.js';
import {
    COMPLEX, NULLABLE, OPTIONAL, SCRATCH,
    ANY, NEVER, REST, SIMPLE, PRIM_MASK, KIND_MASK,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_RECORD,
    K_OR, K_EXCLUSIVE, K_INTERSECT,
    K_UNION, K_TUPLE, K_REFINE, K_NOT,
    K_CONDITIONAL, K_ANY_INNER,
    KIND_ENUM_MASK, K_VALIDATOR,
    V_MIN_LENGTH, V_MAX_LENGTH, V_PATTERN, V_FORMAT,
    V_MINIMUM, V_MAXIMUM, V_MULTIPLE_OF, V_EXCLUSIVE_MINIMUM, V_EXCLUSIVE_MAXIMUM,
    V_MIN_ITEMS, V_MAX_ITEMS, V_CONTAINS, V_MIN_CONTAINS, V_MAX_CONTAINS,
    V_UNIQUE_ITEMS, V_MIN_PROPERTIES, V_MAX_PROPERTIES, V_PATTERN_PROPERTIES, V_PROPERTY_NAMES,
    V_ADDITIONAL_PROPERTIES, V_DEPENDENT_REQUIRED,
    popcnt16,
    FMT_EMAIL, FMT_IPV4, FMT_UUID, FMT_DATETIME,
    FMT_RE_EMAIL, FMT_RE_IPV4, FMT_RE_UUID, FMT_RE_DATETIME,
    codepointLen, hasOwnProperty, toString
} from './const.js';
import {
    sortByKeyId, _isValue
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

    // --- PRE-ALLOCATED COMPLEX TYPE CONSTANTS ---
    // Bare array: K_ARRAY | K_ANY_INNER (1-slot entry)
    KINDS[0] = K_ARRAY | K_ANY_INNER;
    // Bare object: K_OBJECT | K_ANY_INNER (1-slot entry)
    KINDS[1] = K_OBJECT | K_ANY_INNER;
    // Bare record: K_RECORD | K_ANY_INNER (1-slot entry)
    KINDS[2] = K_RECORD | K_ANY_INNER;
    HEAP.KIND_PTR = 3;

    /**
     * Pre-allocated typedef pointers for common bare complex types.
     * These point directly into KINDS[0..2] and avoid any registry allocation.
     */
    let BARE_ARRAY  = (COMPLEX | 0) >>> 0;
    let BARE_OBJECT = (COMPLEX | 1) >>> 0;
    let BARE_RECORD = (COMPLEX | 2) >>> 0;

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
    /**
     * Allocates a KINDS vtable entry. When slots === 1 (K_ANY_INNER), only the
     * header is written and no registry index is stored.
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
            if (slots > 1) {
                S_KINDS[ptr + 1] = registryIndex;
            }
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
        if (slots > 1) {
            KINDS[ptr + 1] = registryIndex;
        }
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

            if ((id + 1) * 2 > heap.TUP_LEN) {
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

            tuples[id * 2] = offset;
            tuples[id * 2 + 1] = count;
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
            if (vHeader & V_MIN_LENGTH) {
                let p = base + popcnt16(vHeader & (V_MIN_LENGTH - 1));
                if (codepointLen(value) < vals[p]) {
                    return false;
                }
            }
            if (vHeader & V_MAX_LENGTH) {
                let p = base + popcnt16(vHeader & (V_MAX_LENGTH - 1));
                if (codepointLen(value) > vals[p]) {
                    return false;
                }
            }
            if (vHeader & V_PATTERN) {
                let p = base + popcnt16(vHeader & (V_PATTERN - 1));
                let regexCache = scratch ? S_REGEX_CACHE : REGEX_CACHE;
                if (!regexCache[vals[p] | 0].test(value)) {
                    return false;
                }
            }
            if (vHeader & V_FORMAT) {
                let p = base + popcnt16(vHeader & (V_FORMAT - 1));
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
            if (vHeader & V_MINIMUM) {
                let p = base + popcnt16(vHeader & (V_MINIMUM - 1));
                if ((vHeader & V_EXCLUSIVE_MINIMUM) ? value <= vals[p] : value < vals[p]) {
                    return false;
                }
            }
            if (vHeader & V_MAXIMUM) {
                let p = base + popcnt16(vHeader & (V_MAXIMUM - 1));
                if ((vHeader & V_EXCLUSIVE_MAXIMUM) ? value >= vals[p] : value > vals[p]) {
                    return false;
                }
            }
            if (vHeader & V_MULTIPLE_OF) {
                let p = base + popcnt16(vHeader & (V_MULTIPLE_OF - 1));
                let quotient = value / vals[p];
                let isMultiple = Math.abs(Math.round(quotient) - quotient) < 1e-8;
                if (!isMultiple) {
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
        if (vHeader & V_MIN_ITEMS) {
            let p = base + popcnt16(vHeader & (V_MIN_ITEMS - 1));
            if (data.length < vals[p]) {
                return false;
            }
        }
        if (vHeader & V_MAX_ITEMS) {
            let p = base + popcnt16(vHeader & (V_MAX_ITEMS - 1));
            if (data.length > vals[p]) {
                return false;
            }
        }
        if (vHeader & V_UNIQUE_ITEMS) {
            let set = new Set(data);
            if (set.size !== data.length) {
                return false;
            }
        }
        if (vHeader & V_CONTAINS) {
            let cp = base + popcnt16(vHeader & (V_CONTAINS - 1));
            let containsType = vals[cp] >>> 0;
            let minC = (vHeader & V_MIN_CONTAINS) ? vals[base + popcnt16(vHeader & (V_MIN_CONTAINS - 1))] : 1;
            let maxC = (vHeader & V_MAX_CONTAINS) ? vals[base + popcnt16(vHeader & (V_MAX_CONTAINS - 1))] : Infinity;
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
        if (vHeader & V_MIN_PROPERTIES) {
            if (keyCount < vals[p++]) {
                return false;
            }
        }
        if (vHeader & V_MAX_PROPERTIES) {
            if (keyCount > vals[p++]) {
                return false;
            }
        }
        if (vHeader & V_PATTERN_PROPERTIES) {
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
        if (vHeader & V_PROPERTY_NAMES) {
            let nameSchema = vals[p++] >>> 0;
            for (let ki = 0; ki < keyCount; ki++) {
                if (!_validate(keys[ki], nameSchema)) {
                    return false;
                }
            }
        }
        if (vHeader & V_DEPENDENT_REQUIRED) {
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
        if (vHeader & V_ADDITIONAL_PROPERTIES) {
            let addType = vals[p++] >>> 0;
            let objects = scratch ? S_OBJECTS : OBJECTS;
            let slab = scratch ? S_SLAB : SLAB;
            let offset = objects[ri * 2];
            let length = objects[ri * 2 + 1];
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
                    if (vHeader & V_PATTERN_PROPERTIES) {
                        // Scan pattern entries — they were already validated above,
                        // but we need to know if this key matched any pattern
                        let pp = valIdx + 1;
                        if (vHeader & V_MIN_PROPERTIES) pp++;
                        if (vHeader & V_MAX_PROPERTIES) pp++;
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
        if (typedef & ANY) {
            return true;
        }
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

            /** Fast path: K_ANY_INNER means no registry entry, just a type check */
            if (header & K_ANY_INNER) {
                if (ct === K_ARRAY) {
                    return Array.isArray(data);
                }
                if (ct === K_RECORD || ct === K_OBJECT) {
                    return typeof data === 'object' && data !== null && !Array.isArray(data);
                }
                return false;
            }

            let ri = kinds[ptr + 1];

            switch (ct) {
                case K_PRIMITIVE: {
                    let primBits = header & SIMPLE;
                    if (!_isValue(data, primBits)) {
                        return false;
                    }
                    if (header & K_VALIDATOR) {
                        return runPrimValidator(data, primBits, ri, scratch);
                    }
                    return true;
                }
                case K_OBJECT: {
                    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                        return false;
                    }
                    let objects = scratch ? S_OBJECTS : OBJECTS;
                    let slab = scratch ? S_SLAB : SLAB;
                    let offset = objects[ri * 2];
                    let length = objects[ri * 2 + 1];
                    for (let i = 0; i < length; i++) {
                        let key = KEY_INDEX.get(slab[offset + (i * 2)]);
                        if (key === void 0) {
                            return false;
                        }
                        let type = slab[offset + (i * 2) + 1];
                        let val = data[key];

                        /** Only pay the 'hasOwnProperty' tax if it looks like a prototype leak */
                        if (val !== void 0 && (typeof val === 'function' || key === '__proto__')) {
                            if (!hasOwnProperty.call(data, key)) {
                                val = void 0;
                            }
                        }
                        if (!_validateSlot(val, type)) {
                            return false;
                        }
                    }
                    if (header & K_VALIDATOR) {
                        return runObjectValidator(data, kinds[ptr + 2], scratch, ri);
                    }
                    return true;
                }
                case K_ARRAY: {
                    if (!Array.isArray(data)) {
                        return false;
                    }
                    let arrays = scratch ? S_ARRAYS : ARRAYS;
                    let innerType = arrays[ri];
                    let length = data.length;
                    for (let i = 0; i < length; i++) {
                        if (!_validateSlot(data[i], innerType)) {
                            return false;
                        }
                    }
                    if (header & K_VALIDATOR) {
                        return runArrayValidator(data, kinds[ptr + 2], scratch);
                    }
                    return true;
                }
                case K_RECORD: {
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
                case K_OR: {
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
                case K_EXCLUSIVE: {
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
                case K_INTERSECT: {
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
                case K_UNION: {
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
                case K_TUPLE: {
                    if (!Array.isArray(data)) {
                        return false;
                    }
                    let tuples = scratch ? S_TUPLES : TUPLES;
                    let slab = scratch ? S_SLAB : SLAB;
                    let offset = tuples[ri * 2];
                    let count = tuples[ri * 2 + 1];
                    let hasRest = count > 0 && (slab[offset + count - 1] & REST) !== 0;
                    let fixedCount = hasRest ? count - 1 : count;
                    if (data.length < fixedCount) {
                        return false;
                    }
                    if (!hasRest && data.length > fixedCount) {
                        return false;
                    }
                    for (let i = 0; i < fixedCount; i++) {
                        if (!_validateSlot(data[i], slab[offset + i])) {
                            return false;
                        }
                    }
                    if (hasRest) {
                        let restType = (slab[offset + count - 1] & ~REST) >>> 0;
                        for (let i = fixedCount; i < data.length; i++) {
                            if (!_validateSlot(data[i], restType)) {
                                return false;
                            }
                        }
                    }
                    if (header & K_VALIDATOR) {
                        return runArrayValidator(data, kinds[ptr + 2], scratch);
                    }
                    return true;
                }
                case K_REFINE: {
                    if (!_validate(data, ri)) {
                        return false;
                    }
                    let callbacks = scratch ? S_CALLBACKS : CALLBACKS;
                    return !!callbacks[kinds[ptr + 2]](data);
                }
                case K_NOT: {
                    return !_validate(data, ri);
                }
                case K_CONDITIONAL: {
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
                default: {
                    return false;
                }
            }
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
     * @returns {number} object registry id
     */
    function registerObject(resolved, count, scratch) {
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
            if ((SCR_HEAP.OBJ_COUNT + 1) * 2 > SCR_HEAP.OBJ_LEN) {
                let buffer = new Uint32Array(SCR_HEAP.OBJ_LEN *= 2);
                buffer.set(S_OBJECTS);
                SCR_HEAP.OBJECTS = S_OBJECTS = buffer;
            }
            let id = SCR_HEAP.OBJ_COUNT++;
            S_OBJECTS[id * 2] = offset;
            S_OBJECTS[id * 2 + 1] = count;
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
        if ((HEAP.OBJ_COUNT + 1) * 2 > HEAP.OBJ_LEN) {
            let buffer = new Uint32Array(HEAP.OBJ_LEN *= 2);
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

    const __heap = {
        HEAP, SCR_HEAP, DICT: { KEY_DICT, KEY_INDEX },
        REGEX_CACHE, CALLBACKS, S_REGEX_CACHE, S_CALLBACKS,
        allocKind, allocValidator, allocOnSlab, lookup,
        registerObject, registerArray, registerUnion,
        _validate,
        BARE_ARRAY, BARE_OBJECT, BARE_RECORD,
        setRewindPending() { rewindPending = true; },
        rewindPending() { return rewindPending; },
        rewind() { rewindScratch(); },
    };

    return { validate, __heap };
}

export {
    catalog, sortByKeyId,
    COMPLEX, NULLABLE, OPTIONAL, SCRATCH,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_RECORD,
    K_OR, K_EXCLUSIVE, K_INTERSECT,
    K_UNION, K_TUPLE, K_REFINE, K_NOT,
    K_CONDITIONAL, K_ANY_INNER,
    K_VALIDATOR as HAS_VALIDATOR,
};

export * from './const.js';
