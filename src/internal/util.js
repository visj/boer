import {
    COMPLEX, NULLABLE, OPTIONAL, SCRATCH,
    ANY, NEVER, FALSE, TRUE, BOOLEAN,
    NUMBER, STRING, INTEGER, BIGINT,
    ARRAY, OBJECT, DATE, URI,
    SIMPLE, PRIM_MASK, KIND_MASK,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_UNION,
    K_REFINE, K_TUPLE, K_RECORD, K_OR, K_EXCLUSIVE,
    K_INTERSECT, K_NOT, K_CONDITIONAL,
    KIND_ENUM_MASK, HAS_VALIDATOR,
    FAIL, toString
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
 * @param {*} raw
 * @param {number} mask - only VALUE bits
 * @param {boolean} reify
 * @returns {*} parsed value, or FAIL
 */
function parseValue(raw, mask, reify) {
    if (mask & ANY) return raw;
    let jsType = typeof raw;
    if (jsType === 'boolean') {
        return (raw ? (mask & TRUE) : (mask & FALSE)) ? raw : FAIL;
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
    if (Array.isArray(raw)) {
        return (mask & ARRAY) ? raw : FAIL;
    }
    if (
        ((mask & BIGINT) && jsType === 'bigint') ||
        ((mask & DATE) && raw instanceof Date) ||
        ((mask & URI) && raw instanceof URL)
    ) {
        return raw;
    }
    if ((mask & OBJECT) && toString.call(raw) === '[object Object]') {
        return raw;
    }
    return FAIL;
}

/**
 * @param {*} raw
 * @param {number} mask - only VALUE bits
 * @returns {boolean}
 */
function _isValue(raw, mask) {
    if (mask & ANY) return true;
    let jsType = typeof raw;
    return (
        jsType === 'string' ? (mask & STRING) !== 0 :
            jsType === 'number' ? ((mask & NUMBER) !== 0 || ((mask & INTEGER) !== 0 && Number.isInteger(raw))) :
                jsType === 'boolean' ? (raw ? (mask & TRUE) : (mask & FALSE)) !== 0 :
                    jsType === 'bigint' ? (mask & BIGINT) !== 0 :
                        Array.isArray(raw) ? (mask & ARRAY) !== 0 :
                            raw instanceof Date ? (mask & DATE) !== 0 :
                                raw instanceof URL ? (mask & URI) !== 0 :
                                    (mask & OBJECT) !== 0 && toString.call(raw) === '[object Object]'
    );
}


/**
 * Appends primitive type labels from bit flags to parts array.
 * @param {number} bits
 * @param {!Array<string>} parts
 */
function describePrimBits(bits, parts) {
    if (bits & ANY) { parts.push('any'); return; }
    if (bits & NEVER) { parts.push('never'); return; }
    if ((bits & BOOLEAN) === BOOLEAN) {
        parts.push('boolean');
    } else {
        if (bits & TRUE) parts.push('true');
        if (bits & FALSE) parts.push('false');
    }
    if (bits & NUMBER) parts.push('number');
    if (bits & STRING) parts.push('string');
    if (bits & INTEGER) parts.push('integer');
    if (bits & BIGINT) parts.push('bigint');
    if (bits & ARRAY) parts.push('Array');
    if (bits & OBJECT) parts.push('Object');
    if (bits & DATE) parts.push('Date');
    if (bits & URI) parts.push('URL');
}

/**
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
        let ptr = type & KIND_MASK;
        let header = kinds[ptr];
        let ct = header & KIND_ENUM_MASK;
        if (ct === K_PRIMITIVE) {
            describePrimBits(header & SIMPLE, parts);
        } else if (ct === K_ARRAY) {
            parts.push('Array');
        } else if (ct === K_UNION) {
            parts.push('Union');
        } else if (ct === K_OBJECT) {
            parts.push('Object');
        } else if (ct === K_REFINE) {
            parts.push('Refined');
        } else if (ct === K_TUPLE) {
            parts.push('Tuple');
        } else if (ct === K_RECORD) {
            parts.push('Record');
        } else if (ct === K_OR) {
            parts.push('Or');
        } else if (ct === K_EXCLUSIVE) {
            parts.push('Exclusive');
        } else if (ct === K_INTERSECT) {
            parts.push('Intersect');
        } else if (ct === K_NOT) {
            parts.push('Not');
        } else if (ct === K_CONDITIONAL) {
            parts.push('Conditional');
        }
    } else {
        describePrimBits(type & PRIM_MASK, parts);
    }
    return parts.join(' | ') || 'unknown';
}

export {
    nullable, optional, isNumber, isObject,
    sortByKeyId, parseValue, _isValue, describeType
}