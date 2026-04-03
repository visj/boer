/**
 * Modified version of fast-deep-equal.
 * Original Copyright (c) 2017 Evgeny Poberezkin
 * See THIRD-PARTY-NOTICES.md for full attribution and license.
 */

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
 * Fast RFC 3339 Date Validator (YYYY-MM-DD)
 */
function isValidDate(str, offset = 0) {
    // Length must be at least 10 for the date part
    if (str.length < offset + 10) return false;
    if (str.charCodeAt(offset + 4) !== 45 || str.charCodeAt(offset + 7) !== 45) return false; // '-'

    let y = (str.charCodeAt(offset) - 48) * 1000 + (str.charCodeAt(offset + 1) - 48) * 100 +
    (str.charCodeAt(offset + 2) - 48) * 10 + (str.charCodeAt(offset + 3) - 48);
    let m = (str.charCodeAt(offset + 5) - 48) * 10 + (str.charCodeAt(offset + 6) - 48);
    let d = (str.charCodeAt(offset + 8) - 48) * 10 + (str.charCodeAt(offset + 9) - 48);

    // Basic bounds
    if (m < 1 || m > 12 || d < 1 || d > 31) return false;

    // Calendar math (Leap years and month lengths)
    if (m === 2) {
        let isLeap = (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0));
        if (d > (isLeap ? 29 : 28)) return false;
    } else if (m === 4 || m === 6 || m === 9 || m === 11) {
        if (d > 30) return false;
    }
    return true;
}

/**
 * Fast RFC 3339 Time Validator (HH:MM:SS[.frac][Z|+HH:MM|-HH:MM])
 * Supports leap seconds (23:59:60).
 */
function isValidTime(str, offset = 0) {
    if (str.length < offset + 8) return false;
    if (str.charCodeAt(offset + 2) !== 58 || str.charCodeAt(offset + 5) !== 58) return false; // ':'

    let h = (str.charCodeAt(offset) - 48) * 10 + (str.charCodeAt(offset + 1) - 48);
    let m = (str.charCodeAt(offset + 3) - 48) * 10 + (str.charCodeAt(offset + 4) - 48);
    let s = (str.charCodeAt(offset + 6) - 48) * 10 + (str.charCodeAt(offset + 7) - 48);

    if (h > 23 || m > 59 || s > 60) return false; // s=60 allows for leap seconds

    let i = offset + 8;

    // Optional fractional seconds: .12345
    if (i < str.length && str.charCodeAt(i) === 46) { // '.'
        i++;
        let fracStart = i;
        while (i < str.length) {
            let c = str.charCodeAt(i);
            if (c >= 48 && c <= 57) i++; // 0-9
            else break;
        }
        if (i === fracStart) return false; // Must have at least one digit after dot
    }

    // Timezone Offset is mandatory in RFC 3339 for time/date-time
    if (i >= str.length) return false;
    let tz = str.charCodeAt(i);

    if (tz === 90 || tz === 122) { // 'Z' or 'z'
        return i === str.length - 1;
    }

    if (tz === 43 || tz === 45) { // '+' or '-'
        if (str.length - i !== 6) return false; // Must be exactly HH:MM
        if (str.charCodeAt(i + 3) !== 58) return false; // ':'

        let tzH = (str.charCodeAt(i + 1) - 48) * 10 + (str.charCodeAt(i + 2) - 48);
        let tzM = (str.charCodeAt(i + 4) - 48) * 10 + (str.charCodeAt(i + 5) - 48);

        if (tzH > 23 || tzM > 59) return false;
        return true;
    }

    return false;
}

function isValidDateTime(str) {
    if (str.length < 19) return false;

    // Must be a valid date
    if (!isValidDate(str, 0)) return false;

    // 10th character must be 'T' or 't'
    let t = str.charCodeAt(10);
    if (t !== 84 && t !== 116) return false;

    // Remaining string must be a valid time
    return isValidTime(str, 11);
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
 * SWAR popcount for lower 16 bits. Returns the number of set bits in x & 0xFFFF.
 * Used to compute payload offset: popcnt16(vHeader & (FLAG - 1))
 * @param {number} x
 * @returns {number}
 */
function popcnt16(x) {
    x = x - ((x >> 1) & 0x5555);
    x = (x & 0x3333) + ((x >> 2) & 0x3333);
    x = (x + (x >> 4)) & 0x0F0F;
    return (x + (x >> 8)) & 0x1F;
}

/**
 * Returns the number of Unicode code points in a string.
 * JSON Schema counts code points, not UTF-16 code units.
 * @param {string} str
 * @returns {number}
 */
function codepointLen(str) {
    let len = 0;
    let strlen = str.length;
    for (let i = 0; i < strlen; i++) {
        let code = str.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) {
            i++;
        }
        len++;
    }
    return len;
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
 * @returns {boolean}
 */
function deepEqual(a, b) {
    if (a === b) {
        return true;
    }

    if (a && b && typeof a == 'object' && typeof b == 'object') {
        if (a.constructor !== b.constructor) {
            return false;
        }

        let length, i;

        if (Array.isArray(a)) {
            length = a.length;
            if (length !== b.length) {
                return false;
            }
            for (i = length; i-- !== 0;) {
                if (!deepEqual(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        }

        if ((a instanceof Map) && (b instanceof Map)) {
            if (a.size !== b.size) {
                return false;
            }
            for (i of a.entries()) {
                if (!b.has(i[0])) {
                    return false;
                }
            }
            for (i of a.entries()) {
                if (!deepEqual(i[1], b.get(i[0]))) {
                    return false;
                }
            }
            return true;
        }

        if ((a instanceof Set) && (b instanceof Set)) {
            if (a.size !== b.size) {
                return false;
            }
            for (i of a.entries()) {
                if (!b.has(i[0])) {
                    return false;
                }
            }
            return true;
        }

        if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
            length = a.length;
            if (length !== b.length) {
                return false;
            }
            for (i = length; i-- !== 0;) {
                if (a[i] !== b[i]) {
                    return false;
                }
            }
            return true;
        }

        if (a.constructor === RegExp) {
            return a.source === b.source && a.flags === b.flags;
        }
        if (a.valueOf !== Object.prototype.valueOf) {
            return a.valueOf() === b.valueOf();
        }
        if (a.toString !== Object.prototype.toString) {
            return a.toString() === b.toString();
        }

        /**
         * Plain object comparison without Object.keys() allocation.
         * Pass 1: iterate a's own keys, verify each exists in b with
         * equal value, and count them.
         * Pass 2: count b's own keys to detect extras.
         */
        let countA = 0;
        for (let k in a) {
            if (!hasOwnProperty.call(a, k)) {
                continue;
            }
            countA++;
            if (!hasOwnProperty.call(b, k)) {
                return false;
            }
            if (!deepEqual(a[k], b[k])) {
                return false;
            }
        }
        let countB = 0;
        for (let k in b) {
            if (hasOwnProperty.call(b, k)) {
                countB++;
            }
        }
        return countA === countB;
    }

    /** True if both NaN, false otherwise */
    return a !== a && b !== b;
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
    isValidDate, isValidTime, isValidDateTime,
    deepEqual, sortByKeyId, parseValue,
    _isValue, describeType,
    binarySearch, binarySearchPair,
    popcnt16, codepointLen
}
