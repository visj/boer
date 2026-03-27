/// <reference path="../../global.d.ts" />
import { config, heap } from './config.js';
import {
    COMPLEX, NULLABLE, OPTIONAL,
    ANY, SIMPLE, VALUE, PRIM_MASK,
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
    K_HAS_ITEMS, K_HAS_REST,
    MODIFIER, MOD_ARRAY, MOD_RECORD, MOD_ENUM, MOD_MASK,
    NUMBER, INTEGER, BOOLEAN
} from './const.js';
import {
    sortByKeyId, _isValue, deepEqual,
} from './util.js';

/**
 * Pre-allocated typedef pointers for common bare complex types.
 * KINDS[0] = K_ARRAY|K_ANY_INNER, KINDS[1] = K_OBJECT|K_ANY_INNER, KINDS[2] = K_RECORD|K_ANY_INNER.
 * Encoding: (1 | (ptr << 3)) where ptr is the raw KINDS array index.
 */
export const BARE_ARRAY = (1 | (0 << 3)) >>> 0;   // KINDS[0]
export const BARE_OBJECT = (1 | (1 << 3)) >>> 0;  // KINDS[1]
export const BARE_RECORD = (1 | (2 << 3)) >>> 0;  // KINDS[2]

/**
 * @template {symbol} R
 * @param {uvd.Config=} cfg 
 * @returns {uvd.Catalog<R>}
 */
function catalog(cfg) {
    cfg = config(cfg);
    let HEAP = heap(cfg.heap);

    let SLAB = HEAP.SLAB;
    let SHAPES = HEAP.SHAPES;
    let KINDS = HEAP.KINDS;
    let VALIDATORS = HEAP.VALIDATORS;
    let REGEX_CACHE = HEAP.REGEX_CACHE;
    let CALLBACKS = HEAP.CALLBACKS;

    /** @type {!Array<*>} Inline constant arena for const values (MOD_ENUM, isSet=0) */
    let CONSTANTS = [];
    /** @type {!Array<!Set<*>>} Inline enum arena for enum Sets (MOD_ENUM, isSet=1) */
    let ENUMS = [];

    // --- KEY DICTIONARY ---
    /** @type {number} */
    let keyseq = 1;
    /** @const @type {!Map<string,number>} */
    let KEY_DICT = new Map();
    /** @const @type {!Array<string>} */
    let KEY_INDEX = [""];

    // --- PRE-ALLOCATED COMPLEX TYPE CONSTANTS ---
    // Bare array: K_ARRAY | K_ANY_INNER (1-slot entry)
    KINDS[0] = K_ARRAY | K_ANY_INNER;
    // Bare object: K_OBJECT | K_ANY_INNER (1-slot entry)
    KINDS[1] = K_OBJECT | K_ANY_INNER;
    // Bare record: K_RECORD | K_ANY_INNER (1-slot entry)
    KINDS[2] = K_RECORD | K_ANY_INNER;
    HEAP.KIND_PTR = 3;


    /** Global stack tracking active dynamic scope boundaries during validation. */
    const DYN_ANCHORS = new Uint32Array(4);
    let DYN_PTR = 0;

    /**
     * Evaluation tracking arena for unevaluatedProperties.
     * TRACK_KEYS: [length, keyId0, keyId1, ...] per frame.
     * TRACK_BITS: [unused, bit0, bit1, ...] per frame (1 = evaluated).
     * TRACK_SNAP: snapshot buffer for branching rollback.
     */
    let TRACK_KEYS = new Uint32Array(32);
    let TRACK_BITS = new Uint32Array(32);  // bit-compacted: 32 keys per word
    let TRACK_SNAP = new Uint32Array(32);  // branch workspace; index 0 is "no snapshot" sentinel
    /** Arena pointer; starts at 1 because 0 is the "no tracking" sentinel for trackPtr */
    let TRACK_TAIL = 1;
    /** Stack pointer for TRACK_SNAP — starts at 1 so snapPtr=0 always means "no snapshot" */
    let SNAP_TAIL = 1;
    /** Temporary storage for unknown key strings during a single validate() call */
    let UNKNOWN_KEYS = new Array(16);
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
     * @param {string} key
     * @returns {number}
     */
    function lookup(key) {
        let id = KEY_DICT.get(key);
        if (id === void 0) {
            id = keyseq++;
            KEY_DICT.set(key, id);
            KEY_INDEX[id] = key;
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
        /** COMPLEX = bit 0, KINDS index encoded in bits 3+: (1 | (ptr << 3)) */
        return (1 | (ptr << 3)) >>> 0;
    }

    /**
     * Public allocation interface. Allocates on the permanent heap.
     *
     * @param {number} header
     * @param {number} inline
     * @param {Array<number>|Uint32Array|null} slabData
     * @param {number} shapeLen
     * @param {number} vHeader
     * @param {Array<number>|null} vPayloads
     * @returns {number}
     */
    function malloc(header, inline, slabData, shapeLen, vHeader, vPayloads) {
        return _malloc(header, inline, slabData, shapeLen, vHeader, vPayloads);
    }

    /**
     * @param {number} vHeader
     * @param {!Array<number>} payloads
     * @returns {number}
     */
    function allocValidator(vHeader, payloads) {
        let needed = 1 + payloads.length;
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
     * Stores a constant value in the CONSTANTS arena. Returns its index.
     * Used for MOD_ENUM with isSet=0 (single-value const match).
     * @param {*} value
     * @returns {number}
     */
    function allocConstant(value) {
        let idx = CONSTANTS.length;
        CONSTANTS.push(value);
        return idx;
    }

    /**
     * Stores a Set in the ENUMS arena. Returns its index.
     * Used for MOD_ENUM with isSet=1 (multi-value enum Set.has() match).
     * @param {!Set<*>} set
     * @returns {number}
     */
    function allocEnumSet(set) {
        let idx = ENUMS.length;
        ENUMS.push(set);
        return idx;
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
     * @returns {boolean}
     */
    function runPrimValidator(value, primBits, valIdx) {
        let vals = VALIDATORS;
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
                if (!REGEX_CACHE[vals[p] | 0].test(value)) {
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
     * @param {number} trackPtr
     * @param {number} snapPtr
     * @returns {boolean}
     */
    function runArrayValidator(data, valIdx, trackPtr, snapPtr) {
        let vals = VALIDATORS;
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
     * Validates object-level constraints (min/maxProperties, patternProperties,
     * propertyNames, dependentRequired, dependentSchemas, additionalProperties).
     *
     * Optimized to avoid Object.keys() allocation. Direct-lookup validators
     * (dependentRequired, dependentSchemas) run first with O(1) hasOwnProperty
     * checks. Only if iteration-based validators exist do we enter a single
     * for..in loop over the object's own keys.
     *
     * @param {!Record<string,any>} data
     * @param {number} valIdx
     * @param {number} ri - SHAPES registry index for this object
     * @param {number} trackPtr - tracking frame pointer (0 = no tracking)
     * @param {number} snapPtr
     * @returns {boolean}
     */
    function runObjectValidator(data, valIdx, ri, trackPtr, snapPtr) {
        let vals = VALIDATORS;
        let vHeader = vals[valIdx] | 0;

        /**
         * Payload is stored in bit order (low bits first). We advance a cursor
         * through the payload sequentially, recording offsets for sections we
         * need to revisit in the iteration loop.
         */
        let p = valIdx + 1;

        // ── 1. SKIP PAST ITERATION-BASED PAYLOADS to reach direct-lookup validators ──
        let pMinProps = p;
        if (vHeader & V_MIN_PROPERTIES) {
            p++;
        }
        if (vHeader & V_MAX_PROPERTIES) {
            p++;
        }
        let pPatternStart = p;
        if (vHeader & V_PATTERN_PROPERTIES) {
            let patternCount = vals[p++] | 0;
            /** Each pattern has [reIdx, schemaType] */
            p += patternCount * 2;
        }
        let pPropertyNames = p;
        if (vHeader & V_PROPERTY_NAMES) {
            p++;
        }

        // ── 2. DIRECT LOOKUP VALIDATORS ──
        // These use O(1) hasOwnProperty lookups — no key iteration needed.

        if (vHeader & V_DEPENDENT_REQUIRED) {
            let triggerCount = vals[p++] | 0;
            for (let ti = 0; ti < triggerCount; ti++) {
                let triggerKey = KEY_INDEX[vals[p++] | 0];
                let depCount = vals[p++] | 0;
                if (triggerKey !== void 0 && hasOwnProperty.call(data, triggerKey)) {
                    for (let di = 0; di < depCount; di++) {
                        let depKey = KEY_INDEX[vals[p++] | 0];
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
                let triggerKey = KEY_INDEX[vals[p++] | 0];
                let depSchemaType = vals[p++];
                if (triggerKey !== void 0 && data[triggerKey] !== void 0) {
                    if (!_validate(data, depSchemaType, trackPtr, snapPtr)) {
                        return false;
                    }
                }
            }
        }

        // ── 3. FAST EXIT: check if any iteration-based validators exist ──
        let needsIter = vHeader & (V_MIN_PROPERTIES | V_MAX_PROPERTIES | V_PATTERN_PROPERTIES | V_PROPERTY_NAMES | V_ADDITIONAL_PROPERTIES);
        if (!needsIter) {
            return true;
        }

        // ── 4. Unpack limits and SLAB info once ──
        let minProps = (vHeader & V_MIN_PROPERTIES) ? vals[pMinProps] : 0;
        let hasMaxProps = (vHeader & V_MAX_PROPERTIES) !== 0;
        let maxProps = hasMaxProps ? vals[pMinProps + ((vHeader & V_MIN_PROPERTIES) ? 1 : 0)] : 0;

        let addType = 0;
        let slabOffset = 0;
        let slabLength = 0;
        if (vHeader & V_ADDITIONAL_PROPERTIES) {
            addType = vals[p];
            /**
             * Object properties are stored in SLAB via SHAPES registry.
             * SHAPES[ri*2] = slab offset, SHAPES[ri*2+1] = property count.
             */
            slabOffset = SHAPES[ri * 2];
            slabLength = SHAPES[ri * 2 + 1];
        }

        let nameSchema = (vHeader & V_PROPERTY_NAMES) ? vals[pPropertyNames] : 0;

        let hasPatterns = (vHeader & V_PATTERN_PROPERTIES) !== 0;
        let hasAdditional = (vHeader & V_ADDITIONAL_PROPERTIES) !== 0;
        let hasPropertyNames = (vHeader & V_PROPERTY_NAMES) !== 0;

        // ── 5. Single zero-allocation loop over all own keys ──
        let keyCount = 0;
        let slab = SLAB;
        let regexCache = REGEX_CACHE;

        for (let key in data) {
            if (!hasOwnProperty.call(data, key)) {
                continue;
            }

            keyCount++;
            /** maxProperties early exit */
            if (hasMaxProps && keyCount > maxProps) {
                return false;
            }

            /** propertyNames: validate the key itself against the name schema */
            if (hasPropertyNames) {
                if (!_validate(key, nameSchema, 0, 0)) {
                    return false;
                }
            }

            let isDeclared = false;
            let patternMatched = false;

            /**
             * additionalProperties needs to know if this key is declared
             * in the object's static properties. Binary search on SLAB
             * where properties are stored sorted by keyId.
             */
            if (hasAdditional) {
                let keyId = KEY_DICT.get(key);
                if (keyId !== void 0) {
                    let lo = 0;
                    let hi = slabLength - 1;
                    while (lo <= hi) {
                        let mid = (lo + hi) >>> 1;
                        let sk = slab[slabOffset + (mid << 1)];
                        if (sk === keyId) {
                            isDeclared = true;
                            break;
                        }
                        if (sk < keyId) {
                            lo = mid + 1;
                        } else {
                            hi = mid - 1;
                        }
                    }
                }
            }

            /** patternProperties: test key against each regex pattern */
            if (hasPatterns) {
                let pp = pPatternStart;
                let patternCount = vals[pp++] | 0;
                for (let pi = 0; pi < patternCount; pi++) {
                    let reIdx = vals[pp++] | 0;
                    let schemaType = vals[pp++];
                    if (regexCache[reIdx].test(key)) {
                        patternMatched = true;
                        if (!_validate(data[key], schemaType, 0, 0)) {
                            return false;
                        }
                        if (trackPtr) {
                            let kid = resolveTrackingKey(key);
                            if (kid !== void 0) {
                                markEvaluated(trackPtr, snapPtr, kid);
                            }
                        }
                    }
                }
            }

            /** additionalProperties: validate undeclared, unmatched keys */
            if (hasAdditional && !isDeclared && !patternMatched) {
                if (addType === 0) {
                    return false;
                }
                if (!_validate(data[key], addType, 0, 0)) {
                    return false;
                }
                if (trackPtr) {
                    let markKid = resolveTrackingKey(key);
                    if (markKid !== void 0) {
                        markEvaluated(trackPtr, snapPtr, markKid);
                    }
                }
            }
        }

        /** minProperties: checked after the loop since we need the final count */
        if (keyCount < minProps) {
            return false;
        }

        return true;
    }

    /**
     * @param {*} raw
     * @param {number} type
     * @returns {boolean}
     */
    /**
     * Whether a primitive (non-complex) typedef accepts null or undefined via ANY.
     * ANY = bit 3; COMPLEX = bit 0. Safe to check after confirming !(type & COMPLEX).
     * @param {number} type
     * @returns {boolean}
     */
    function _primitiveAcceptsNull(type) {
        return (type & COMPLEX) === 0 && (type & ANY) !== 0;
    }

    /**
     * Validates data against an inline MOD_ENUM typedef.
     * Encoding: primBits(3-7) | MODIFIER(8) | MOD_ENUM(9-10) | isSet(11) | index(12-29)
     * @param {*} data
     * @param {number} typedef
     * @returns {boolean}
     */
    function _validateModEnum(data, typedef) {
        let primBits = typedef & PRIM_MASK;
        // Check base type matches (skip for ANY)
        if (primBits & VALUE) {
            if (!_isValue(data, primBits)) return false;
        }
        let isSet = (typedef >>> 11) & 1;
        let idx = (typedef >>> 12) & 0x3FFFF; // 18 bits
        if (isSet) {
            return ENUMS[idx].has(data);
        }
        return CONSTANTS[idx] === data;
    }

    /**
     * Validates data against an inline typedef (COMPLEX=0, typedef > 0xFF).
     * Handles MOD_ARRAY, MOD_RECORD, MOD_ENUM modifiers, and inline
     * primitive validators (STRING with minLength/maxLength/pattern,
     * NUMBER/INTEGER with min/max bounds).
     *
     * Bit layout (30-bit, stays within V8 Smi range):
     *   Bits 0-7:   primBits (COMPLEX=0, NULLABLE, OPTIONAL, type flags)
     *   Bit 8:      MODIFIER toggle
     *   Bits 9-10:  modifier type (0=ARRAY, 1=RECORD, 2=ENUM)
     *   Bits 11-29: contextual payload (depends on modifier/type)
     *
     * @param {*} data
     * @param {number} typedef
     * @returns {boolean}
     */
    function _validateInline(data, typedef) {
        let primBits = typedef & PRIM_MASK;

        if (typedef & MODIFIER) {
            let modType = (typedef >>> 9) & 3;

            if (modType === 2) {
                /** MOD_ENUM: exact-match against CONSTANTS or ENUMS arena */
                return _validateModEnum(data, typedef);
            }

            if (modType === 0) {
                /**
                 * MOD_ARRAY: homogeneous array (e.g. string[])
                 * Bit 11: UNIQUE flag
                 * Bits 12-21 (10 bits): maxItems (0 = no max)
                 * Bits 22-29 (8 bits): minItems (0 = no min)
                 */
                if (!Array.isArray(data)) {
                    return false;
                }
                let len = data.length;
                let maxItems = (typedef >>> 12) & 0x3FF;
                let minItems = (typedef >>> 22) & 0xFF;
                if (minItems > 0 && len < minItems) {
                    return false;
                }
                if (maxItems > 0 && len > maxItems) {
                    return false;
                }
                let mask = primBits;
                for (let i = 0; i < len; i++) {
                    if (!_isValue(data[i], mask)) {
                        return false;
                    }
                }
                let unique = (typedef >>> 11) & 1;
                if (unique) {
                    for (let i = 0; i < len; i++) {
                        for (let j = i + 1; j < len; j++) {
                            if (deepEqual(data[i], data[j])) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            }

            if (modType === 1) {
                /**
                 * MOD_RECORD: dynamic dictionary (e.g. Record<string, number>)
                 * Bits 11-21 (11 bits): maxProperties (0 = no max)
                 * Bits 22-29 (8 bits): minProperties (0 = no min)
                 */
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    return false;
                }
                let mask = primBits;
                let maxProps = (typedef >>> 11) & 0x7FF;
                let minProps = (typedef >>> 22) & 0xFF;
                let count = 0;
                for (let key in data) {
                    if (!hasOwnProperty.call(data, key)) {
                        continue;
                    }
                    if (!_isValue(data[key], mask)) {
                        return false;
                    }
                    count++;
                    if (maxProps > 0 && count > maxProps) {
                        return false;
                    }
                }
                if (minProps > 0 && count < minProps) {
                    return false;
                }
                return true;
            }

            return false;
        }

        /**
         * Inline primitive validator (MODIFIER=0, typedef > 0xFF).
         * The specific type determines the payload layout.
         */
        if (primBits & STRING) {
            /**
             * STRING payload:
             *   Bits 9-16  (8 bits): regexIdx (0 = no pattern)
             *   Bits 17-24 (8 bits): maxLength (0 = no max)
             *   Bits 25-29 (5 bits): minLength (0 = no min)
             */
            if (typeof data !== 'string') {
                return false;
            }
            let regexIdx = (typedef >>> 9) & 0xFF;
            let maxLen = (typedef >>> 17) & 0xFF;
            let minLen = (typedef >>> 25) & 0x1F;
            if (minLen > 0 || maxLen > 0) {
                let rawLen = data.length;
                /** Fast reject: UTF-16 len < minLen → codepoint len even smaller */
                if (minLen > 0 && rawLen < minLen) {
                    return false;
                }
                let needsScan = (minLen > 0) || (maxLen > 0 && rawLen > maxLen);
                if (needsScan) {
                    let slen = codepointLen(data);
                    if (minLen > 0 && slen < minLen) {
                        return false;
                    }
                    if (maxLen > 0 && slen > maxLen) {
                        return false;
                    }
                }
            }
            if (regexIdx > 0 && !REGEX_CACHE[regexIdx].test(data)) {
                return false;
            }
            return true;
        }

        if (primBits & (NUMBER | INTEGER)) {
            /**
             * NUMBER/INTEGER payload:
             *   Bit 9:           EXCLUSIVE_MIN (0 = >=, 1 = >)
             *   Bit 10:          EXCLUSIVE_MAX (0 = <=, 1 = <)
             *   Bit 11:          MIN_NEGATIVE (0 = positive, 1 = negative)
             *   Bit 12:          MAX_NEGATIVE (0 = positive, 1 = negative)
             *   Bits 13-21 (9b): minMagnitude (0 = no min, 1-511)
             *   Bits 22-29 (8b): maxMagnitude (0 = no max, 1-255)
             */
            if (typeof data !== 'number') {
                return false;
            }
            if ((primBits & INTEGER) && !Number.isInteger(data)) {
                return false;
            }
            let minMag = (typedef >>> 13) & 0x1FF;
            if (minMag > 0) {
                let minNeg = (typedef >>> 11) & 1;
                let exclMin = (typedef >>> 9) & 1;
                let minVal = minNeg ? -minMag : minMag;
                if (exclMin ? data <= minVal : data < minVal) {
                    return false;
                }
            }
            let maxMag = (typedef >>> 22) & 0xFF;
            if (maxMag > 0) {
                let maxNeg = (typedef >>> 12) & 1;
                let exclMax = (typedef >>> 10) & 1;
                let maxVal = maxNeg ? -maxMag : maxMag;
                if (exclMax ? data >= maxVal : data > maxVal) {
                    return false;
                }
            }
            return true;
        }

        if (primBits & BOOLEAN) {
            return typeof data === 'boolean';
        }

        if (primBits & ANY) {
            return true;
        }

        return false;
    }

    function _validateSlot(raw, type) {
        if (raw === void 0) return (type & OPTIONAL) !== 0;
        if (raw === null) return (type & NULLABLE) !== 0 || _primitiveAcceptsNull(type);
        if (type & COMPLEX) return _validate(raw, type, 0, 0);
        if (type < 256) {
            return (type & SIMPLE) ? _isValue(raw, type & PRIM_MASK) : false;
        }
        /** Inline path: MOD_ENUM, MOD_ARRAY, MOD_RECORD, or inline primitive validator */
        return _validateInline(raw, type);
    }

    /**
     * @param {*} data
     * @param {number} typedef
     * @param {number} trackPtr - tracking frame pointer (0 = no tracking)
     * @param {number} snapPtr - 0 = write direct to TRACK_BITS, >0 = write to TRACK_SNAP
     * @returns {boolean}
     */
    function _validate(data, typedef, trackPtr, snapPtr) {
        if (data == null) {
            let nullBit = data === null ? NULLABLE : OPTIONAL;
            if (typedef & nullBit) return true;
            if (!(typedef & COMPLEX)) {
                /**
                 * Primitive typedef: ANY accepts everything (including null/undefined).
                 * ANY = bit 3 is safe to check here since COMPLEX = bit 0 is 0.
                 */
                if (typedef & ANY) return true;
                return false;
            }
            // COMPLEX types: fall through to kind handler (needed for K_CONDITIONAL)
        }
        if (typedef & COMPLEX) {
            let ptr = typedef >>> 3;
            let kinds = KINDS;
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
                /**
                 * K_PRIMITIVE + K_ANY_INNER: the original type included ANY.
                 * Fall through to K_PRIMITIVE dispatch which skips the _isValue check.
                 */
                if (ct !== K_PRIMITIVE) {
                    return false;
                }
            }

            let ri = kinds[ptr + 1];

            switch (ct) {
                case K_PRIMITIVE: {
                    let primBits = header & SIMPLE;
                    /**
                     * K_ANY_INNER means the type included ANY — skip the _isValue type check.
                     * We still run the validator (minimum, pattern etc.) if K_VALIDATOR is set.
                     */
                    if (!(header & K_ANY_INNER) && !_isValue(data, primBits)) {
                        return false;
                    }
                    if (header & K_VALIDATOR) {
                        return runPrimValidator(data, primBits, ri);
                    }
                    return true;
                }
                case K_OBJECT: {
                    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                        return false;
                    }
                    let shapes = SHAPES;
                    let slab = SLAB;
                    let offset = shapes[ri * 2];
                    let length = shapes[ri * 2 + 1];
                    for (let i = 0; i < length; i++) {
                        let keyId = slab[offset + (i * 2)];
                        let key = KEY_INDEX[keyId];
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
                        return runObjectValidator(data, kinds[ptr + 2], ri, trackPtr, snapPtr);
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
                        return runArrayValidator(data, kinds[ptr + 2], trackPtr, snapPtr);
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
                    let shapes = SHAPES;
                    let slab = SLAB;
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
                    let shapes = SHAPES;
                    let slab = SLAB;
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
                    let shapes = SHAPES;
                    let slab = SLAB;
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
                    let shapes = SHAPES;
                    let slab = SLAB;
                    let offset = shapes[ri * 2];
                    let length = shapes[ri * 2 + 1];
                    // slab[offset] is the discriminator key id; variants follow at offset+1
                    let discKey = KEY_INDEX[slab[offset]];
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
                    let shapes = SHAPES;
                    let slab = SLAB;
                    let offset = shapes[ri * 2];
                    let count = shapes[ri * 2 + 1];
                    let hasRest = (header & K_HAS_REST) !== 0;
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
                        let restType = slab[offset + count - 1];
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
                        return runArrayValidator(data, kinds[ptr + 2], trackPtr, snapPtr);
                    }
                    return true;
                }
                case K_REFINE: {
                    let shapes = SHAPES;
                    let slab = SLAB;
                    let offset = shapes[ri * 2];
                    let innerType = slab[offset];
                    let callbackIdx = slab[offset + 1];
                    if (!_validate(data, innerType, trackPtr, snapPtr)) {
                        return false;
                    }
                    let callbacks = CALLBACKS;
                    return !!callbacks[callbackIdx](data);
                }
                case K_NOT: {
                    /** not never produces annotations per JSON Schema spec */
                    return !_validate(data, ri, 0, 0);
                }
                case K_CONDITIONAL: {
                    let shapes = SHAPES;
                    let slab = SLAB;
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
                        return _validate(data, thenType, trackPtr, snapPtr);
                    } else {
                        return _validate(data, elseType, trackPtr, snapPtr);
                    }
                }
                case K_DYN_ANCHOR: {
                    let shapes = SHAPES;
                    let slab = SLAB;
                    let offset = shapes[ri * 2];
                    DYN_ANCHORS[DYN_PTR++] = ri;
                    let valid = _validate(data, slab[offset], trackPtr, snapPtr);
                    DYN_PTR--;
                    return valid;
                }
                case K_DYN_REF: {
                    let shapes = SHAPES;
                    let slab = SLAB;
                    let offset = shapes[ri * 2];
                    let anchorKeyId = slab[offset];
                    let targetType = slab[offset + 1];
                    // Search the scope stack outermost (0) to innermost (DYN_PTR - 1).
                    // The first match wins per Draft 2020-12 spec.
                    scan: for (let i = 0; i < DYN_PTR; i++) {
                        let scopeRi = DYN_ANCHORS[i];
                        let scopeShapes = SHAPES;
                        let scopeSlab = SLAB;
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
                    let shapes = SHAPES;
                    let slab = SLAB;
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
        /** Inline path: typedef > 0xFF with COMPLEX=0 (MOD_*, inline validators) */
        if (typedef > 0xFF) {
            return _validateInline(data, typedef);
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
        return _validate(data, typedef, 0, 0);
    }

    const __heap = {
        HEAP, DICT: { KEY_DICT, KEY_INDEX },
        REGEX_CACHE, CALLBACKS,
        malloc, allocValidator, lookup,
        allocConstant, allocEnumSet,
        CONSTANTS, ENUMS,
        _validate,
        BARE_ARRAY, BARE_OBJECT, BARE_RECORD,
    };

    return { validate, __heap };
}

export {
    catalog, sortByKeyId,
    COMPLEX, NULLABLE, OPTIONAL,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_RECORD,
    K_OR, K_EXCLUSIVE, K_INTERSECT,
    K_UNION, K_TUPLE, K_REFINE, K_NOT,
    K_CONDITIONAL, K_DYN_ANCHOR, K_DYN_REF, K_UNEVALUATED, K_ANY_INNER,
    K_VALIDATOR,
};

export * from './const.js';
