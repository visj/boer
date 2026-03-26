/// <reference path="../../global.d.ts" />
import { config, heap } from './config.js';
import {
    COMPLEX, NULLABLE, OPTIONAL, SCRATCH,
    ANY, NEVER, REST, SIMPLE, PRIM_MASK, KIND_MASK,
    STRING,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_RECORD,
    K_OR, K_EXCLUSIVE, K_INTERSECT,
    K_UNION, K_TUPLE, K_REFINE, K_NOT,
    K_CONDITIONAL, K_DYN_ANCHOR, K_DYN_REF, K_UNEVALUATED, K_ANY_INNER,
    KIND_ENUM_MASK, K_VALIDATOR,
    V_MIN_LENGTH, V_MAX_LENGTH, V_PATTERN, V_FORMAT,
    V_MINIMUM, V_MAXIMUM, V_MULTIPLE_OF, V_EXCLUSIVE_MINIMUM, V_EXCLUSIVE_MAXIMUM,
    V_MIN_ITEMS, V_MAX_ITEMS, V_CONTAINS, V_MIN_CONTAINS, V_MAX_CONTAINS,
    V_UNIQUE_ITEMS, V_MIN_PROPERTIES, V_MAX_PROPERTIES, V_PATTERN_PROPERTIES, V_PROPERTY_NAMES,
    V_ADDITIONAL_PROPERTIES, V_DEPENDENT_REQUIRED, V_DEPENDENT_SCHEMAS,
    V_ENUM, K_STRICT,
    popcnt16,
    FMT_EMAIL, FMT_IPV4, FMT_UUID, FMT_DATETIME,
    FMT_RE_EMAIL, FMT_RE_IPV4, FMT_RE_UUID, FMT_RE_DATETIME,
    codepointLen, hasOwnProperty,
    K_HAS_ITEMS
} from './const.js';
import {
    sortByKeyId, _isValue, deepEqual,
} from './util.js';

/**
 * Pre-allocated typedef pointers for common bare complex types.
 * These point directly into KINDS[0..2] and avoid any registry allocation.
 */
export const BARE_ARRAY = (COMPLEX | 0) >>> 0;
export const BARE_OBJECT = (COMPLEX | 1) >>> 0;
export const BARE_RECORD = (COMPLEX | 2) >>> 0;

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

    let REWIND_PENDING = false;

    /** Global stack tracking active dynamic scope boundaries during validation. */
    const DYN_ANCHORS = new Uint32Array(512);
    let DYN_PTR = 0;

    /**
     * Evaluation tracking arena for unevaluatedProperties.
     * TRACK_KEYS: [length, keyId0, keyId1, ...] per frame.
     * TRACK_BITS: [unused, bit0, bit1, ...] per frame (1 = evaluated).
     * TRACK_SNAP: snapshot buffer for branching rollback.
     */
    let TRACK_KEYS = new Uint32Array(256);
    let TRACK_BITS = new Uint32Array(256);  // bit-compacted: 32 keys per word
    let TRACK_SNAP = new Uint32Array(256);  // branch workspace; index 0 is "no snapshot" sentinel
    /** Arena pointer; starts at 1 because 0 is the "no tracking" sentinel for trackPtr */
    let TRACK_TAIL = 1;
    /** Stack pointer for TRACK_SNAP — starts at 1 so snapPtr=0 always means "no snapshot" */
    let SNAP_TAIL = 1;
    /** Temporary storage for unknown key strings during a single validate() call */
    let UNKNOWN_KEYS = new Array(32);
    let UNKNOWN_TAIL = 0;

    /**
     * Resolves a string key to its tracking keyId.
     * Known keys are found in KEY_DICT. Unknown keys were registered in UNKNOWN_KEYS
     * during K_UNEVALUATED frame allocation with MSB set as the id.
     * Returns undefined if the key is not in the current tracking frame.
     * @param {string} key
     * @returns {number|undefined}
     */
    function resolveTrackingKey(key) {
        let kid = KEY_DICT.get(key);
        if (kid !== void 0) {
            return kid;
        }
        for (let i = 0; i < UNKNOWN_TAIL; i++) {
            if (UNKNOWN_KEYS[i] === key) {
                return (i | 0x80000000) >>> 0;
            }
        }
        return void 0;
    }

    /**
     * Marks a key as evaluated in the tracking frame.
     * If snapPtr is 0, writes directly to TRACK_BITS (frame is committed).
     * If snapPtr > 0, writes to TRACK_SNAP at the branch's reserved slot.
     * @param {number} trackPtr - frame start in TRACK_KEYS/TRACK_BITS
     * @param {number} snapPtr - 0 = commit direct, >0 = write to TRACK_SNAP[snapPtr]
     * @param {number} keyId - the keyId to mark (may have MSB set for unknown keys)
     */
    function markEvaluated(trackPtr, snapPtr, keyId) {
        let len = TRACK_KEYS[trackPtr];
        for (let i = 0; i < len; i++) {
            if (TRACK_KEYS[trackPtr + 1 + i] === keyId) {
                let wordOffset = i >>> 5;
                let bitMask = 1 << (i & 31);
                if (snapPtr === 0) {
                    TRACK_BITS[trackPtr + 1 + wordOffset] |= bitMask;
                } else {
                    TRACK_SNAP[snapPtr + wordOffset] |= bitMask;
                }
                return;
            }
        }
    }

    /**
     * Marks array items as evaluated in the tracking frame.
     * If snapPtr is 0, writes directly to TRACK_BITS.
     * If snapPtr > 0, writes to TRACK_SNAP at the branch's reserved slot.
     * @param {number} trackPtr - frame start in TRACK_KEYS/TRACK_BITS
     * @param {number} snapPtr - 0 = commit direct, >0 = write to TRACK_SNAP[snapPtr]
     * @param {number} startIdx - first index to mark
     * @param {number} endIdx - one past the last index to mark
     */
    function markItemsEvaluated(trackPtr, snapPtr, startIdx, endIdx) {
        let len = TRACK_KEYS[trackPtr];
        let end = endIdx < len ? endIdx : len;
        for (let i = startIdx; i < end; i++) {
            let wordOffset = i >>> 5;
            let bitMask = 1 << (i & 31);
            if (snapPtr === 0) {
                TRACK_BITS[trackPtr + 1 + wordOffset] |= bitMask;
            } else {
                TRACK_SNAP[snapPtr + wordOffset] |= bitMask;
            }
        }
    }

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
        REWIND_PENDING = false;
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
     * Non-recursive binary search over a Float64Array slice.
     * Returns true if `target` is found in arr[offset .. offset+length-1].
     * @param {Float64Array} arr
     * @param {number} offset — first index of the search range
     * @param {number} length — number of elements to search
     * @param {number} target
     * @returns {boolean}
     */
    function binarySearch(arr, offset, length, target) {
        let lo = 0;
        let hi = length - 1;
        while (lo <= hi) {
            let mid = (lo + hi) >>> 1;
            let val = arr[offset + mid];
            if (val === target) { return true; }
            if (val < target) { lo = mid + 1; }
            else { hi = mid - 1; }
        }
        return false;
    }

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
        // V_ENUM: binary search for the value in the sorted enum payload.
        // The sequential section starts right after the fixed-slot payloads (bits 0-15),
        // since bits 16-19 are K_OBJECT only and are never set on K_PRIMITIVE validators.
        if (vHeader & V_ENUM) {
            let p = base + popcnt16(vHeader & 0xFFFF);
            if (typeof value === 'string') {
                let strCount = vals[p] | 0;
                let keyId = KEY_DICT.get(value);
                if (keyId === void 0) { return false; }
                if (!binarySearch(vals, p + 1, strCount, keyId)) { return false; }
            } else if (typeof value === 'number') {
                if (primBits & STRING) {
                    // Skip the string segment to reach the number segment.
                    let strCount = vals[p] | 0;
                    p += 1 + strCount;
                }
                let numCount = vals[p] | 0;
                if (!binarySearch(vals, p + 1, numCount, value)) { return false; }
            }
        }
        return true;
    }

    /**
     * @param {!Array<*>} data
     * @param {number} valIdx
     * @param {boolean} scratch
     * @param {number} trackPtr
     * @param {number} snapPtr
     * @returns {boolean}
     */
    function runArrayValidator(data, valIdx, scratch, trackPtr, snapPtr) {
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
            let length = data.length;
            for (let i = 0; i < length; i++) {
                for (let j = i + 1; j < length; j++) {
                    if (deepEqual(data[i], data[j])) {
                        return false;
                    }
                }
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
                if (_validate(data[i], containsType, 0, 0)) {
                    matchCount++;
                    /** Mark matching item as evaluated by contains */
                    if (trackPtr) {
                        markItemsEvaluated(trackPtr, snapPtr, i, i + 1);
                    }
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
     * @param {number} trackPtr - tracking frame pointer (0 = no tracking)
     * @param {number} snapPtr
     * @returns {boolean}
     */
    function runObjectValidator(data, valIdx, scratch, ri, trackPtr, snapPtr) {
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
                        if (!_validate(data[keys[ki]], schemaType, 0, 0)) {
                            return false;
                        }
                        if (trackPtr) {
                            let kid = resolveTrackingKey(keys[ki]);
                            if (kid !== void 0) {
                                markEvaluated(trackPtr, snapPtr, kid);
                            }
                        }
                    }
                }
            }
        }
        if (vHeader & V_PROPERTY_NAMES) {
            let nameSchema = vals[p++] >>> 0;
            for (let ki = 0; ki < keyCount; ki++) {
                if (!_validate(keys[ki], nameSchema, 0, 0)) {
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
                // Use hasOwnProperty so that null/false/0 values still count as "present".
                if (triggerKey !== void 0 && hasOwnProperty.call(data, triggerKey)) {
                    for (let di = 0; di < depCount; di++) {
                        let depKeyId = vals[p++] | 0;
                        let depKey = KEY_INDEX.get(depKeyId);
                        if (depKey === void 0 || !hasOwnProperty.call(data, depKey)) {
                            return false;
                        }
                    }
                } else {
                    p += depCount;
                }
            }
        }
        if (vHeader & V_DEPENDENT_SCHEMAS) {
            let depCount = vals[p++] | 0;
            for (let di = 0; di < depCount; di++) {
                let triggerKeyId = vals[p++] | 0;
                let depSchemaType = vals[p++] >>> 0;
                let triggerKey = KEY_INDEX.get(triggerKeyId);
                if (triggerKey !== void 0 && data[triggerKey] !== void 0) {
                    if (!_validate(data, depSchemaType, trackPtr, snapPtr)) {
                        return false;
                    }
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
                        if (!_validate(data[keys[ki]], addType, 0, 0)) {
                            return false;
                        }
                        /** Mark property as evaluated by additionalProperties */
                        if (trackPtr) {
                            let markKid = resolveTrackingKey(keys[ki]);
                            if (markKid !== void 0) {
                                markEvaluated(trackPtr, snapPtr, markKid);
                            }
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
                    (type & COMPLEX) ? _validate(raw, type, 0, 0) :
                        (type & SIMPLE) ? _isValue(raw, type & PRIM_MASK) :
                            false
        );
    }

    /**
     * @param {*} data
     * @param {number} typedef
     * @param {number} trackPtr - tracking frame pointer (0 = no tracking)
     * @param {number} snapPtr - 0 = write direct to TRACK_BITS, >0 = write to TRACK_SNAP
     * @returns {boolean}
     */
    function _validate(data, typedef, trackPtr, snapPtr) {
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
                        let keyId = slab[offset + (i * 2)];
                        let key = KEY_INDEX.get(keyId);
                        if (key === void 0) {
                            return false;
                        }
                        let type = slab[offset + (i * 2) + 1];
                        let val = data[key];

                        if (val !== void 0) {
                            if (!hasOwnProperty.call(data, key)) {
                                val = void 0;
                            }
                        }
                        if (!_validateSlot(val, type)) {
                            return false;
                        }
                        /** Mark this property as evaluated in the tracking frame */
                        if (trackPtr && val !== void 0) {
                            markEvaluated(trackPtr, snapPtr, keyId);
                        }
                    }
                    if (header & K_VALIDATOR) {
                        return runObjectValidator(data, kinds[ptr + 2], scratch, ri, trackPtr, snapPtr);
                    }
                    return true;
                }
                case K_ARRAY: {
                    if (!Array.isArray(data)) {
                        return false;
                    }
                    let hasItems = (header & K_HAS_ITEMS) !== 0;
                    if (hasItems) {
                        let innerType = ri;
                        let length = data.length;
                        for (let i = 0; i < length; i++) {
                            if (!_validateSlot(data[i], innerType)) {
                                return false;
                            }
                        }
                        /** items evaluates ALL items */
                        if (trackPtr) {
                            markItemsEvaluated(trackPtr, snapPtr, 0, length);
                        }
                    }
                    if (header & K_VALIDATOR) {
                        return runArrayValidator(data, kinds[ptr + 2], scratch, trackPtr, snapPtr);
                    }
                    return true;
                }
                case K_RECORD: {
                    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                        return false;
                    }
                    let valueType = ri;
                    for (let key in data) {
                        if (hasOwnProperty.call(data, key)) {
                            if (!_validateSlot(data[key], valueType)) {
                                return false;
                            }
                        }
                    }
                    return true;
                }
                case K_OR: {
                    let shapes = scratch ? S_SHAPES : SHAPES;
                    let slab = scratch ? S_SLAB : SLAB;
                    let offset = shapes[ri * 2];
                    let count = shapes[ri * 2 + 1];
                    if (trackPtr) {
                        /**
                         * Reserve-Run-Commit for anyOf:
                         * Each branch gets a fresh TRACK_SNAP slot to write into.
                         * Passing branches are OR'd into a merged slot.
                         * TRACK_BITS is only touched on final commit — never mid-branch.
                         */
                        let keyCount = TRACK_KEYS[trackPtr];
                        let words = (keyCount + 31) >>> 5;
                        let snapStart = SNAP_TAIL;
                        let mergedSnap = SNAP_TAIL;
                        SNAP_TAIL += words;
                        TRACK_SNAP.fill(0, mergedSnap, mergedSnap + words);
                        let anyMatch = false;
                        for (let i = 0; i < count; i++) {
                            let currentSnap = SNAP_TAIL;
                            SNAP_TAIL += words;
                            TRACK_SNAP.fill(0, currentSnap, currentSnap + words);
                            if (_validate(data, slab[offset + i], trackPtr, currentSnap)) {
                                anyMatch = true;
                                for (let w = 0; w < words; w++) {
                                    TRACK_SNAP[mergedSnap + w] |= TRACK_SNAP[currentSnap + w];
                                }
                            }
                            SNAP_TAIL = currentSnap;  // drop this branch's slot
                        }
                        if (anyMatch) {
                            for (let w = 0; w < words; w++) {
                                if (snapPtr === 0) {
                                    TRACK_BITS[trackPtr + 1 + w] |= TRACK_SNAP[mergedSnap + w];
                                } else {
                                    TRACK_SNAP[snapPtr + w] |= TRACK_SNAP[mergedSnap + w];
                                }
                            }
                        }
                        SNAP_TAIL = snapStart;
                        return anyMatch;
                    }
                    for (let i = 0; i < count; i++) {
                        if (_validate(data, slab[offset + i], 0, 0)) {
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
                    if (trackPtr) {
                        /**
                         * Reserve-Run-Commit for oneOf:
                         * Each branch gets a fresh TRACK_SNAP slot.
                         * Failed branches are dropped (SNAP_TAIL reset).
                         * Exactly 1 passing branch's bits are committed to destination.
                         */
                        let keyCount = TRACK_KEYS[trackPtr];
                        let words = (keyCount + 31) >>> 5;
                        let matchCount = 0;
                        let snapStart = SNAP_TAIL;
                        let winnerSnap = 0;
                        for (let i = 0; i < count; i++) {
                            let currentSnap = SNAP_TAIL;
                            SNAP_TAIL += words;
                            TRACK_SNAP.fill(0, currentSnap, currentSnap + words);
                            if (_validate(data, slab[offset + i], trackPtr, currentSnap)) {
                                matchCount++;
                                if (matchCount === 1) {
                                    winnerSnap = currentSnap;
                                } else {
                                    /** Second match — abort immediately */
                                    SNAP_TAIL = snapStart;
                                    return false;
                                }
                            } else {
                                SNAP_TAIL = currentSnap;  // drop failed branch's slot
                            }
                        }
                        if (matchCount === 1) {
                            for (let w = 0; w < words; w++) {
                                if (snapPtr === 0) {
                                    TRACK_BITS[trackPtr + 1 + w] |= TRACK_SNAP[winnerSnap + w];
                                } else {
                                    TRACK_SNAP[snapPtr + w] |= TRACK_SNAP[winnerSnap + w];
                                }
                            }
                            SNAP_TAIL = snapStart;
                            return true;
                        }
                        SNAP_TAIL = snapStart;
                        return false;
                    }
                    let matchCount = 0;
                    for (let i = 0; i < count; i++) {
                        if (_validate(data, slab[offset + i], 0, 0)) {
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
                        if (!_validate(data, slab[offset + i], trackPtr, snapPtr)) {
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
                    if (valueId === void 0) {
                        return false;
                    }
                    for (let i = 0; i < length; i++) {
                        if (slab[offset + 1 + i * 2] === valueId) {
                            return _validate(data, slab[offset + 2 + i * 2], 0, 0);
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

                    let isStrict = (header & K_STRICT) !== 0;
                    let length = data.length;
                    if (isStrict) {
                        if (
                            length < fixedCount ||
                            (!hasRest && length > fixedCount)
                        ) {
                            return false;
                        }
                    }
                    let checkCount = length < fixedCount ? length : fixedCount;
                    for (let i = 0; i < checkCount; i++) {
                        if (!_validateSlot(data[i], slab[offset + i])) {
                            return false;
                        }
                    }
                    /** Mark prefix items as evaluated */
                    if (trackPtr) {
                        markItemsEvaluated(trackPtr, snapPtr, 0, checkCount);
                    }
                    if (hasRest) {
                        let restType = (slab[offset + count - 1] & ~REST) >>> 0;
                        for (let i = checkCount; i < length; i++) {
                            if (!_validateSlot(data[i], restType)) {
                                return false;
                            }
                        }
                        /** Mark rest items as evaluated */
                        if (trackPtr && length > checkCount) {
                            markItemsEvaluated(trackPtr, snapPtr, checkCount, length);
                        }
                    }
                    if (header & K_VALIDATOR) {
                        return runArrayValidator(data, kinds[ptr + 2], scratch, trackPtr, snapPtr);
                    }
                    return true;
                }
                case K_REFINE: {
                    let shapes = scratch ? S_SHAPES : SHAPES;
                    let slab = scratch ? S_SLAB : SLAB;
                    let offset = shapes[ri * 2];
                    let innerType = slab[offset];
                    let callbackIdx = slab[offset + 1];
                    if (!_validate(data, innerType, trackPtr, snapPtr)) {
                        return false;
                    }
                    let callbacks = scratch ? S_CALLBACKS : CALLBACKS;
                    return !!callbacks[callbackIdx](data);
                }
                case K_NOT: {
                    /** not never produces annotations per JSON Schema spec */
                    return !_validate(data, ri, 0, 0);
                }
                case K_CONDITIONAL: {
                    let shapes = scratch ? S_SHAPES : SHAPES;
                    let slab = scratch ? S_SLAB : SLAB;
                    let offset = shapes[ri * 2];
                    let ifType = slab[offset];
                    let thenType = slab[offset + 1];
                    let elseType = slab[offset + 2];
                    /**
                     * The `if` branch runs in isolation: a failed `if` must not leave
                     * partial markings. Reserve a fresh snapPtr for it; commit only if it passes.
                     */
                    let ifPassed;
                    if (trackPtr) {
                        let words = (TRACK_KEYS[trackPtr] + 31) >>> 5;
                        let ifSnap = SNAP_TAIL;
                        SNAP_TAIL += words;
                        TRACK_SNAP.fill(0, ifSnap, ifSnap + words);
                        ifPassed = _validate(data, ifType, trackPtr, ifSnap);
                        if (ifPassed) {
                            for (let w = 0; w < words; w++) {
                                if (snapPtr === 0) {
                                    TRACK_BITS[trackPtr + 1 + w] |= TRACK_SNAP[ifSnap + w];
                                } else {
                                    TRACK_SNAP[snapPtr + w] |= TRACK_SNAP[ifSnap + w];
                                }
                            }
                        }
                        SNAP_TAIL = ifSnap;  // reclaim if-snap slot
                    } else {
                        ifPassed = _validate(data, ifType, 0, 0);
                    }
                    if (ifPassed) {
                        return thenType === 0 ? true : _validate(data, thenType, trackPtr, snapPtr);
                    } else {
                        return elseType === 0 ? true : _validate(data, elseType, trackPtr, snapPtr);
                    }
                }
                case K_DYN_ANCHOR: {
                    let shapes = scratch ? S_SHAPES : SHAPES;
                    let slab = scratch ? S_SLAB : SLAB;
                    let offset = shapes[ri * 2];
                    DYN_ANCHORS[DYN_PTR++] = scratch ? (ri | 0x80000000) : ri;
                    let valid = _validate(data, slab[offset], trackPtr, snapPtr);
                    DYN_PTR--;
                    return valid;
                }
                case K_DYN_REF: {
                    let shapes = scratch ? S_SHAPES : SHAPES;
                    let slab = scratch ? S_SLAB : SLAB;
                    let offset = shapes[ri * 2];
                    let anchorKeyId = slab[offset];
                    let targetType = slab[offset + 1];
                    // Search the scope stack outermost (0) to innermost (DYN_PTR - 1).
                    // The first match wins per Draft 2020-12 spec.
                    scan: for (let i = 0; i < DYN_PTR; i++) {
                        let entry = DYN_ANCHORS[i];
                        let scopeScratch = (entry & 0x80000000) !== 0;
                        let scopeRi = entry & 0x7FFFFFFF;
                        let scopeShapes = scopeScratch ? S_SHAPES : SHAPES;
                        let scopeSlab = scopeScratch ? S_SLAB : SLAB;
                        let scopeOffset = scopeShapes[scopeRi * 2];
                        let count = scopeShapes[scopeRi * 2 + 1];
                        // Binary search the sorted [anchorKeyId, targetType] pairs.
                        // Skip SLAB[scopeOffset] which is the innerType.
                        let lo = 0;
                        let hi = count - 1;
                        while (lo <= hi) {
                            let mid = (lo + hi) >>> 1;
                            let currentKey = scopeSlab[scopeOffset + 1 + mid * 2];
                            if (currentKey === anchorKeyId) {
                                targetType = scopeSlab[scopeOffset + 1 + mid * 2 + 1];
                                break scan;
                            }
                            if (currentKey < anchorKeyId) {
                                lo = mid + 1;
                            } else {
                                hi = mid - 1;
                            }
                        }
                    }
                    return _validate(data, targetType, trackPtr, snapPtr);
                }
                case K_UNEVALUATED: {
                    /**
                     * K_UNEVALUATED wraps an inner type with evaluation tracking.
                     * SLAB layout: [innerType, unevalSchemaType, mode]
                     * mode=0: property tracking (objects)
                     * mode=1: item tracking (arrays)
                     *
                     * Frame layout in TRACK_KEYS: [count, id0, id1, ...idN]
                     * Frame layout in TRACK_BITS (Uint32, bit-compacted):
                     *   TRACK_BITS[frameStart + 1 + (i >>> 5)] bit (1 << (i & 31)) = evaluated?
                     *
                     * TRACK_TAIL advances by 1 + count; bit words fit inside since
                     * words = (count + 31) >>> 5 <= count for count >= 1.
                     */
                    let shapes = scratch ? S_SHAPES : SHAPES;
                    let slab = scratch ? S_SLAB : SLAB;
                    let offset = shapes[ri * 2];
                    let innerType = slab[offset];
                    let unevalType = slab[offset + 1];
                    let unevalMode = slab[offset + 2];

                    if (unevalMode === 1) {
                        // ── Items tracking (arrays) ──
                        if (!Array.isArray(data)) {
                            return _validate(data, innerType, trackPtr, snapPtr);
                        }
                        let itemCount = data.length;
                        let frameStart = TRACK_TAIL;
                        let words = (itemCount + 31) >>> 5;
                        /** Grow arena if needed */
                        if (frameStart + 1 + itemCount > TRACK_KEYS.length) {
                            let newLen = Math.max(TRACK_KEYS.length * 2, frameStart + 1 + itemCount + 64);
                            let newKeys = new Uint32Array(newLen);
                            let newBits = new Uint32Array(newLen);
                            let newSnap = new Uint32Array(newLen);
                            newKeys.set(TRACK_KEYS);
                            newBits.set(TRACK_BITS);
                            newSnap.set(TRACK_SNAP);
                            TRACK_KEYS = newKeys;
                            TRACK_BITS = newBits;
                            TRACK_SNAP = newSnap;
                        }
                        TRACK_KEYS[frameStart] = itemCount;
                        for (let w = 0; w < words; w++) {
                            TRACK_BITS[frameStart + 1 + w] = 0;
                        }
                        TRACK_TAIL = frameStart + 1 + itemCount;

                        if (!_validate(data, innerType, frameStart, 0)) {
                            TRACK_TAIL = frameStart;
                            return false;
                        }

                        /** Check unevaluated items via bit test */
                        for (let i = 0; i < itemCount; i++) {
                            if ((TRACK_BITS[frameStart + 1 + (i >>> 5)] & (1 << (i & 31))) === 0) {
                                if (!_validate(data[i], unevalType, 0, 0)) {
                                    TRACK_TAIL = frameStart;
                                    return false;
                                }
                            }
                        }

                        /** Mark all items as evaluated in parent frame (if parent is tracking) */
                        if (trackPtr) {
                            markItemsEvaluated(trackPtr, snapPtr, 0, itemCount);
                        }

                        TRACK_TAIL = frameStart;
                        return true;
                    }

                    // ── Property tracking (objects) ──
                    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                        return _validate(data, innerType, trackPtr, snapPtr);
                    }

                    /**
                     * Allocate tracking frame: TRACK_KEYS[frameStart] = keyCount,
                     * then [keyId0, keyId1, ...] for each own property.
                     * Unknown keys (not in KEY_DICT) use the MSB hack to avoid
                     * calling lookup() — which would permanently store attacker-controlled
                     * strings in KEY_DICT and cause unbounded memory growth.
                     */
                    let frameStart = TRACK_TAIL;
                    let keyCount = 0;
                    for (let key in data) {
                        if (!hasOwnProperty.call(data, key)) {
                            continue;
                        }
                        let kid = KEY_DICT.get(key);
                        if (kid === void 0) {
                            /** MSB hack: store string in UNKNOWN_KEYS, encode index with MSB set */
                            let uIdx = UNKNOWN_TAIL++;
                            UNKNOWN_KEYS[uIdx] = key;
                            kid = (uIdx | 0x80000000) >>> 0;
                        }
                        /** Grow arena if needed (check before writing) */
                        if (frameStart + 1 + keyCount >= TRACK_KEYS.length) {
                            let newLen = TRACK_KEYS.length * 2;
                            let newKeys = new Uint32Array(newLen);
                            let newBits = new Uint32Array(newLen);
                            let newSnap = new Uint32Array(newLen);
                            newKeys.set(TRACK_KEYS);
                            newBits.set(TRACK_BITS);
                            newSnap.set(TRACK_SNAP);
                            TRACK_KEYS = newKeys;
                            TRACK_BITS = newBits;
                            TRACK_SNAP = newSnap;
                        }
                        TRACK_KEYS[frameStart + 1 + keyCount] = kid;
                        keyCount++;
                    }
                    TRACK_KEYS[frameStart] = keyCount;
                    let words = (keyCount + 31) >>> 5;
                    for (let w = 0; w < words; w++) {
                        TRACK_BITS[frameStart + 1 + w] = 0;
                    }
                    TRACK_TAIL = frameStart + 1 + keyCount;

                    /** Validate inner type with tracking enabled (snapPtr=0 → direct to TRACK_BITS) */
                    if (!_validate(data, innerType, frameStart, 0)) {
                        TRACK_TAIL = frameStart;
                        return false;
                    }

                    /** Check unevaluated properties via bit test */
                    let ki = 0;
                    for (let key in data) {
                        if (!hasOwnProperty.call(data, key)) {
                            continue;
                        }
                        if ((TRACK_BITS[frameStart + 1 + (ki >>> 5)] & (1 << (ki & 31))) === 0) {
                            /** This property was not evaluated by any keyword */
                            if (!_validate(data[key], unevalType, 0, 0)) {
                                TRACK_TAIL = frameStart;
                                return false;
                            }
                        }
                        ki++;
                    }

                    /** Mark all our keys as evaluated in parent frame (if parent is tracking) */
                    if (trackPtr) {
                        ki = 0;
                        for (let key in data) {
                            if (!hasOwnProperty.call(data, key)) {
                                continue;
                            }
                            let kid = TRACK_KEYS[frameStart + 1 + ki];
                            markEvaluated(trackPtr, snapPtr, kid);
                            ki++;
                        }
                    }

                    TRACK_TAIL = frameStart;
                    return true;
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
        /** GC: null out unknown key strings BEFORE resetting the counter */
        UNKNOWN_KEYS.fill(null, 0, UNKNOWN_TAIL);
        // TODO I might refactor this later and send -1 so we can actually use index 0, it just makes more sense...
        DYN_PTR = 0;
        SNAP_TAIL = 1;
        TRACK_TAIL = 1;
        UNKNOWN_TAIL = 0;
        REWIND_PENDING = true;
        return _validate(data, typedef, 0, 0);
    }

    function setRewindPending() {
        REWIND_PENDING = true;
    }

    function rewindPending() {
        return REWIND_PENDING;
    }

    const __heap = {
        HEAP, SCR_HEAP, DICT: { KEY_DICT, KEY_INDEX },
        REGEX_CACHE, CALLBACKS, S_REGEX_CACHE, S_CALLBACKS,
        malloc, allocValidator, lookup,
        _validate,
        BARE_ARRAY, BARE_OBJECT, BARE_RECORD,
        setRewindPending,
        rewindPending,
        rewind: rewindScratch,
    };

    return { validate, __heap };
}

export {
    catalog, sortByKeyId,
    COMPLEX, NULLABLE, OPTIONAL, SCRATCH,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_RECORD,
    K_OR, K_EXCLUSIVE, K_INTERSECT,
    K_UNION, K_TUPLE, K_REFINE, K_NOT,
    K_CONDITIONAL, K_DYN_ANCHOR, K_DYN_REF, K_UNEVALUATED, K_ANY_INNER,
    K_VALIDATOR,
};

export * from './const.js';
