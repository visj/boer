import {
    COMPLEX, NULLABLE, OPTIONAL,
    ANY, BOOLEAN,
    NUMBER, STRING, INTEGER,
    SIMPLE, PRIM_MASK,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_RECORD,
    K_OR, K_EXCLUSIVE, K_INTERSECT,
    K_UNION, K_TUPLE, K_REFINE, K_NOT,
    K_CONDITIONAL,
    KIND_ENUM_MASK, K_VALIDATOR,
    FAIL, toString, hasOwnProperty
} from './const.js';

/**
 * @template T
 * @template {uvd.Type<T>} D
 * @param {D} typedef
 * @returns {D}
 */
function nullable(typedef) {
    //@ts-ignore
    return (typedef | NULLABLE) >>> 0;
}

/**
 * @template T
 * @template {uvd.Type<T>} D
 * @param {D} typedef
 * @returns {D}
 */
function optional(typedef) {
    //@ts-ignore
    return (typedef | OPTIONAL) >>> 0;
}

/**
 * 
 * @param {*} value
 * @returns {value is string} 
 */
function isString(value) {
    return typeof value === 'string';
}

/**
 * 
 * @param {*} value 
 * @returns {value is boolean}
 */
function isBoolean(value) {
    return typeof value === 'boolean';
}

/**
 *
 * @param {*} value
 * @returns {value is number}
 */
function isNumber(value) {
    return typeof value === 'number';
}

/**
 *
 * @param {*} value
 * @returns {value is Record<string, any>}
 */
function isObject(value) {
    return value !== null && typeof value === 'object';
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
 * Parses a raw value against a primitive type bitmask, with optional reification.
 * ARRAY and OBJECT are complex-only; they do not appear in this function.
 * @param {*} raw
 * @param {number} mask - only VALUE bits
 * @param {boolean} reify
 * @returns {*} parsed value, or FAIL
 */
function parseValue(raw, mask, reify) {
    if (mask & ANY) {
        return raw;
    }
    let jsType = typeof raw;
    if (jsType === 'boolean') {
        return (mask & BOOLEAN) ? raw : FAIL;
    }
    if (jsType === 'number') {
        if (mask & NUMBER) {
            return raw;
        }
        return FAIL;
    }
    if (jsType === 'string') {
        if (mask & STRING) {
            return raw;
        }
        return FAIL;
    }
    return FAIL;
}

/**
 * Fast path type check for primitive value bits.
 * @param {*} raw
 * @param {number} mask - only VALUE bits
 * @returns {boolean}
 */
function _isValue(raw, mask) {
    if (mask & ANY) {
        return true;
    }
    let jsType = typeof raw;
    return (
        jsType === 'string' ? (mask & STRING) !== 0 :
            jsType === 'number' ? ((mask & NUMBER) !== 0 || ((mask & INTEGER) !== 0 && Number.isInteger(raw))) :
                jsType === 'boolean' ? (mask & BOOLEAN) !== 0 :
                    false
    );
}


/**
 * Appends primitive type labels from bit flags to parts array.
 * ARRAY and OBJECT are complex-only; they don't appear here.
 * @param {number} bits
 * @param {!Array<string>} parts
 */
function describePrimBits(bits, parts) {
    if (bits & ANY) { parts.push('any'); return; }
    if (bits & BOOLEAN) { parts.push('boolean'); }
    if (bits & NUMBER) { parts.push('number'); }
    if (bits & STRING) { parts.push('string'); }
    if (bits & INTEGER) { parts.push('integer'); }
}

/**
 * Describes a typedef for diagnostic messages. Uses the new grouped KINDS enum.
 * @param {number} type
 * @param {Uint32Array} kinds
 * @returns {string}
 */
function describeType(type, kinds) {
    /** @type {!Array<string>} */
    let parts = [];
    if (type & OPTIONAL) {
        parts.push('undefined');
    }
    if (type & NULLABLE) {
        parts.push('null');
    }
    if (type & COMPLEX) {
        let kindsIdx = (type >>> 3) << 1;
        let header = kinds[kindsIdx];
        let ct = header & KIND_ENUM_MASK;
        switch (ct) {
            case K_PRIMITIVE:
                describePrimBits(header & SIMPLE, parts);
                break;
            case K_OBJECT:
                parts.push('Object');
                break;
            case K_ARRAY:
                parts.push('Array');
                break;
            case K_RECORD:
                parts.push('Record');
                break;
            case K_OR:
                parts.push('Or');
                break;
            case K_EXCLUSIVE:
                parts.push('Exclusive');
                break;
            case K_INTERSECT:
                parts.push('Intersect');
                break;
            case K_UNION:
                parts.push('Union');
                break;
            case K_TUPLE:
                parts.push('Tuple');
                break;
            case K_REFINE:
                parts.push('Refined');
                break;
            case K_NOT:
                parts.push('Not');
                break;
            case K_CONDITIONAL:
                parts.push('Conditional');
                break;
        }
    } else {
        describePrimBits(type & PRIM_MASK, parts);
    }
    return parts.join(' | ') || 'unknown';
}

/**
 * 
 * @param {*} a 
 * @param {*} b 
 * @returns 
 */
function deepEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    let ta = typeof a, tb = typeof b;
    if (ta !== tb) return false;
    if (ta !== 'object') return false; 
    let isArrA = Array.isArray(a);
    let isArrB = Array.isArray(b);
    if (isArrA !== isArrB) return false;
    if (isArrA) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) return false;
        }
        return true;
    }
    let keysA = Object.keys(a);
    let keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (let i = 0; i < keysA.length; i++) {
        let k = keysA[i];
        if (!hasOwnProperty.call(b, k)) return false;
        if (!deepEqual(a[k], b[k])) return false;
    }
    return true;
}

/**
 * Non-recursive binary search over a slice of any numeric array.
 * Returns true if `target` is found in arr[offset .. offset+length-1].
 * @param {Float64Array|Uint32Array} arr
 * @param {number} offset - first index of the search range
 * @param {number} length - number of elements to search
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
 * Non-recursive binary search over stride-2 pair entries [key, value, key, value, ...].
 * Searches arr[offset + mid*2] for target. Returns the matched index mid on success,
 * or -1 if not found. The caller retrieves the associated value via arr[offset + mid*2 + 1].
 * @param {Uint32Array} arr
 * @param {number} offset - first index of the key/value pairs
 * @param {number} count - number of pairs to search
 * @param {number} target
 * @returns {number} mid index, or -1
 */
function binarySearchPair(arr, offset, count, target) {
    let lo = 0;
    let hi = count - 1;
    while (lo <= hi) {
        let mid = (lo + hi) >>> 1;
        let key = arr[offset + mid * 2];
        if (key === target) { return mid; }
        if (key < target) { lo = mid + 1; }
        else { hi = mid - 1; }
    }
    return -1;
}

export {
    nullable, optional,
    isNumber, isString, isObject, isBoolean,
    deepEqual, sortByKeyId, parseValue,
    _isValue, describeType,
    binarySearch, binarySearchPair,
}
