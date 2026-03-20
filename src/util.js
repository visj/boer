import {
    COMPLEX, NULLABLE, OPTIONAL, VOLATILE,
    BOOLEAN, NUMBER, STRING, BIGINT, DATE,
    URI, INTEGER, PRIMITIVE, PRIM_MASK, KIND_MASK,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_UNION,
    K_REFINE, K_TUPLE, K_RECORD, K_OR, K_EXCLUSIVE,
    K_INTERSECT, K_NOT, K_CONDITIONAL,
    KIND_ENUM_MASK, HAS_VALIDATOR,
    STR_MIN_LENGTH, STR_MAX_LENGTH, STR_PATTERN, STR_FORMAT,
    NUM_MINIMUM, NUM_MAXIMUM, NUM_EX_MIN, NUM_EX_MAX, NUM_MULTIPLE_OF,
    ARR_MIN_ITEMS, ARR_MAX_ITEMS, ARR_UNIQUE, ARR_CONTAINS, ARR_MIN_CONTAINS,
    ARR_MAX_CONTAINS, OBJ_MIN_PROPS, OBJ_MAX_PROPS, OBJ_PATTERN_PROPS,
    OBJ_PROP_NAMES, OBJ_DEP_REQUIRED, OBJ_NO_ADDITIONAL,
    FMT_EMAIL, FMT_IPV4, FMT_UUID, FMT_DATETIME, FMT_MAP,
    STRIP, PLAIN, NOT_STRICT, STRICT_REJECT, STRICT_DELETE, STRICT_PROTO,
    STRICT_MODE_MASK, U8, U16, U32, FAIL
} from './const.js';

/**
 * @template T
 * @template {uvd.cat.Primitive<T> | uvd.cat.Complex<T>} D
 * @param {D} typedef
 * @returns {D}
 */
function nullable(typedef) {
    //@ts-ignore
    return (typedef | NULLABLE) >>> 0;
}

/**
 * @template T
 * @template {uvd.cat.Primitive<T> | uvd.cat.Complex<T>} D
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
function _isValue(raw, mask) {
    let jsType = typeof raw;
    return (
        jsType === 'string' ? (mask & STRING) !== 0 :
            jsType === 'number' ? ((mask & NUMBER) !== 0 || ((mask & INTEGER) !== 0 && Number.isInteger(raw))) :
                jsType === 'boolean' ? (mask & BOOLEAN) !== 0 :
                    jsType === 'bigint' ? (mask & BIGINT) !== 0 :
                        raw instanceof Date ? (mask & DATE) !== 0 :
                            raw instanceof URL ? (mask & URI) !== 0 : false
    );
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
                let primBits = header & PRIMITIVE;
                if (primBits & BOOLEAN) {
                    parts.push('boolean');
                }
                if (primBits & NUMBER) {
                    parts.push('number');
                }
                if (primBits & STRING) {
                    parts.push('string');
                }
                if (primBits & BIGINT) {
                    parts.push('bigint');
                }
                if (primBits & DATE) {
                    parts.push('Date');
                }
                if (primBits & URI) {
                    parts.push('URL');
                }
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
            if (type & BOOLEAN) {
                parts.push('boolean');
            }
            if (type & NUMBER) {
                parts.push('number');
            }
            if (type & STRING) {
                parts.push('string');
            }
            if (type & BIGINT) {
                parts.push('bigint');
            }
            if (type & DATE) {
                parts.push('Date');
            }
            if (type & URI) {
                parts.push('URL');
            }
        }
        return parts.join(' | ') || 'unknown';
    }

export {
    nullable, optional, isNumber, isObject,
    sortByKeyId, parseValue, _isValue, describeType
}