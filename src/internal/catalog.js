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
    let SHAPES = HEAP.SHAPES;
    let KINDS = HEAP.KINDS;
    let VALIDATORS = HEAP.VALIDATORS;
    let REGEX_CACHE = HEAP.REGEX_CACHE;
    let CALLBACKS = HEAP.CALLBACKS;

    // Scratch heap store
    let S_SLAB = SCR_HEAP.SLAB;
    let S_SHAPES = SCR_HEAP.SHAPES;
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
        SCR_HEAP.SHAPE_COUNT = 0;
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
     * Internal allocator for the Permanent Heap. Writes slabData to SLAB,
     * registers a SHAPES entry, optionally writes a validator, then writes
     * a KINDS entry. Returns a permanent COMPLEX typedef pointer.
     *
     * @param {number} header
     * @param {number} inline - stored as KINDS[ptr+1] when slabData is null
     * @param {Array<number>|Uint32Array|null} slabData
     * @param {number} shapeLen - semantic length stored in SHAPES slot 1
     * @param {number} vHeader
     * @param {Array<number>|null} vPayloads
     * @returns {number}
     */
    function _malloc(header, inline, slabData, shapeLen, vHeader, vPayloads) {
        let ri = inline;
        if (slabData !== null) {
            let count = slabData.length;
            if (HEAP.PTR + count > HEAP.SLAB_LEN) {
                let buffer = new Uint32Array(HEAP.SLAB_LEN *= 2);
                buffer.set(SLAB);
                HEAP.SLAB = SLAB = buffer;
            }
            let offset = HEAP.PTR;
            HEAP.SLAB.set(slabData, offset);
            HEAP.PTR += count;
            ri = HEAP.SHAPE_COUNT++;
            if ((ri + 1) * 2 > HEAP.SHAPE_LEN) {
                let buffer = new Uint32Array(HEAP.SHAPE_LEN *= 2);
                buffer.set(SHAPES);
                HEAP.SHAPES = SHAPES = buffer;
            }
            HEAP.SHAPES[ri * 2] = offset;
            HEAP.SHAPES[ri * 2 + 1] = shapeLen;
        }
        let valIdx = 0, slots = 2;
        if (vHeader !== 0 && vPayloads !== null) {
            slots = 3;
            let vCount = vPayloads.length;
            if (HEAP.VAL_PTR + vCount + 1 > HEAP.VAL_LEN) {
                let buffer = new Float64Array(HEAP.VAL_LEN *= 2);
                buffer.set(VALIDATORS);
                HEAP.VALIDATORS = VALIDATORS = buffer;
            }
            valIdx = HEAP.VAL_PTR;
            HEAP.VALIDATORS[valIdx] = vHeader;
            HEAP.VALIDATORS.set(vPayloads, valIdx + 1);
            HEAP.VAL_PTR += vCount + 1;
        }
        let ptr = HEAP.KIND_PTR;
        if (ptr + slots > HEAP.KIND_LEN) {
            let buffer = new Uint32Array(HEAP.KIND_LEN *= 2);
            buffer.set(KINDS);
            HEAP.KINDS = KINDS = buffer;
        }
        HEAP.KINDS[ptr] = header;
        HEAP.KINDS[ptr + 1] = ri;
        if (slots === 3) { HEAP.KINDS[ptr + 2] = valIdx; }
        HEAP.KIND_PTR += slots;
        return (COMPLEX | ptr) >>> 0;
    }

    /**
     * Internal allocator for the Scratch Heap. Identical logic to _malloc
     * but targets SCR_HEAP buffers. Returns a scratch COMPLEX typedef pointer.
     *
     * @param {number} header
     * @param {number} inline
     * @param {Array<number>|Uint32Array|null} slabData
     * @param {number} shapeLen
     * @param {number} vHeader
     * @param {Array<number>|null} vPayloads
     * @returns {number}
     */
    function _smalloc(header, inline, slabData, shapeLen, vHeader, vPayloads) {
        let ri = inline;
        if (slabData !== null) {
            let count = slabData.length;
            if (SCR_HEAP.PTR + count > SCR_HEAP.SLAB_LEN) {
                let buffer = new Uint32Array(SCR_HEAP.SLAB_LEN *= 2);
                buffer.set(S_SLAB);
                SCR_HEAP.SLAB = S_SLAB = buffer;
            }
            let offset = SCR_HEAP.PTR;
            SCR_HEAP.SLAB.set(slabData, offset);
            SCR_HEAP.PTR += count;
            ri = SCR_HEAP.SHAPE_COUNT++;
            if ((ri + 1) * 2 > SCR_HEAP.SHAPE_LEN) {
                let buffer = new Uint32Array(SCR_HEAP.SHAPE_LEN *= 2);
                buffer.set(S_SHAPES);
                SCR_HEAP.SHAPES = S_SHAPES = buffer;
            }
            SCR_HEAP.SHAPES[ri * 2] = offset;
            SCR_HEAP.SHAPES[ri * 2 + 1] = shapeLen;
        }
        let valIdx = 0, slots = 2;
        if (vHeader !== 0 && vPayloads !== null) {
            slots = 3;
            let vCount = vPayloads.length;
            if (SCR_HEAP.VAL_PTR + vCount + 1 > SCR_HEAP.VAL_LEN) {
                let buffer = new Float64Array(SCR_HEAP.VAL_LEN *= 2);
                buffer.set(S_VALIDATORS);
                SCR_HEAP.VALIDATORS = S_VALIDATORS = buffer;
            }
            valIdx = SCR_HEAP.VAL_PTR;
            SCR_HEAP.VALIDATORS[valIdx] = vHeader;
            SCR_HEAP.VALIDATORS.set(vPayloads, valIdx + 1);
            SCR_HEAP.VAL_PTR += vCount + 1;
        }
        let ptr = SCR_HEAP.KIND_PTR;
        if (ptr + slots > SCR_HEAP.KIND_LEN) {
            let buffer = new Uint32Array(SCR_HEAP.KIND_LEN *= 2);
            buffer.set(S_KINDS);
            SCR_HEAP.KINDS = S_KINDS = buffer;
        }
        SCR_HEAP.KINDS[ptr] = header;
        SCR_HEAP.KINDS[ptr + 1] = ri;
        if (slots === 3) { SCR_HEAP.KINDS[ptr + 2] = valIdx; }
        SCR_HEAP.KIND_PTR += slots;
        return (COMPLEX | SCRATCH | ptr) >>> 0;
    }

    /**
     * Public allocation interface. Dispatches to _malloc (permanent) or
     * _smalloc (scratch) based on the scratch flag.
     *
     * @param {number} header
     * @param {boolean} scratch
     * @param {number} inline
     * @param {Array<number>|Uint32Array|null} slabData
     * @param {number} shapeLen
     * @param {number} vHeader
     * @param {Array<number>|null} vPayloads
     * @returns {number}
     */
    function malloc(header, scratch, inline, slabData, shapeLen, vHeader, vPayloads) {
        return (scratch ? _smalloc : _malloc)(header, inline, slabData, shapeLen, vHeader, vPayloads);
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
            let shapes = scratch ? S_SHAPES : SHAPES;
            let slab = scratch ? S_SLAB : SLAB;
            let offset = shapes[ri * 2];
            let length = shapes[ri * 2 + 1];
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
                    let shapes = scratch ? S_SHAPES : SHAPES;
                    let slab = scratch ? S_SLAB : SLAB;
                    let offset = shapes[ri * 2];
                    let length = shapes[ri * 2 + 1];
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
                    let innerType = ri;
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
                    let shapes = scratch ? S_SHAPES : SHAPES;
                    let slab = scratch ? S_SLAB : SLAB;
                    let offset = shapes[ri * 2];
                    let count = shapes[ri * 2 + 1];
                    for (let i = 0; i < count; i++) {
                        if (_validate(data, slab[offset + i])) {
                            return true;
                        }
                    }
                    return false;
                }
                case K_EXCLUSIVE: {
                    let shapes = scratch ? S_SHAPES : SHAPES;
                    let slab = scratch ? S_SLAB : SLAB;
                    let offset = shapes[ri * 2];
                    let count = shapes[ri * 2 + 1];
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
                    let shapes = scratch ? S_SHAPES : SHAPES;
                    let slab = scratch ? S_SLAB : SLAB;
                    let offset = shapes[ri * 2];
                    let count = shapes[ri * 2 + 1];
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
                    let shapes = scratch ? S_SHAPES : SHAPES;
                    let slab = scratch ? S_SLAB : SLAB;
                    let offset = shapes[ri * 2];
                    let length = shapes[ri * 2 + 1];
                    // slab[offset] is the discriminator key id; variants follow at offset+1
                    let discKey = KEY_INDEX.get(slab[offset]);
                    if (discKey === void 0) {
                        return false;
                    }
                    let valueId = KEY_DICT.get(data[discKey]);
                    for (let i = 0; i < length; i++) {
                        if (slab[offset + 1 + i * 2] === valueId) {
                            return _validate(data, slab[offset + 2 + i * 2]);
                        }
                    }
                    return false;
                }
                case K_TUPLE: {
                    if (!Array.isArray(data)) {
                        return false;
                    }
                    let shapes = scratch ? S_SHAPES : SHAPES;
                    let slab = scratch ? S_SLAB : SLAB;
                    let offset = shapes[ri * 2];
                    let count = shapes[ri * 2 + 1];
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
                    let shapes = scratch ? S_SHAPES : SHAPES;
                    let slab = scratch ? S_SLAB : SLAB;
                    let offset = shapes[ri * 2];
                    let innerType = slab[offset];
                    let callbackIdx = slab[offset + 1];
                    if (!_validate(data, innerType)) {
                        return false;
                    }
                    let callbacks = scratch ? S_CALLBACKS : CALLBACKS;
                    return !!callbacks[callbackIdx](data);
                }
                case K_NOT: {
                    return !_validate(data, ri);
                }
                case K_CONDITIONAL: {
                    let shapes = scratch ? S_SHAPES : SHAPES;
                    let slab = scratch ? S_SLAB : SLAB;
                    let offset = shapes[ri * 2];
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

    const __heap = {
        HEAP, SCR_HEAP, DICT: { KEY_DICT, KEY_INDEX },
        REGEX_CACHE, CALLBACKS, S_REGEX_CACHE, S_CALLBACKS,
        malloc, allocValidator, lookup,
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
