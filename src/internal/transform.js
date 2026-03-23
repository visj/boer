/// <reference path="../../global.d.ts" />
import {
    COMPLEX, NULLABLE, OPTIONAL, SCRATCH,
    ANY, REST, SIMPLE, PRIM_MASK, KIND_MASK,
    K_PRIMITIVE, K_OBJECT, K_COLLECTION, K_COMPOSITION,
    K_UNION, K_TUPLE, K_WRAPPER, K_CONDITIONAL,
    K_ARRAY, K_RECORD, K_OR, K_EXCLUSIVE, K_INTERSECT,
    K_REFINE, K_NOT, K_ANY_INNER,
    KIND_ENUM_MASK, FAIL,
} from './const.js';
import { parseValue } from './util.js';

/**
 * Creates a `conform` function bound to the given catalog's heap.
 * Conform is the transform path: it coerces values (Date from string, etc.)
 * and mutates the holder in-place for reified types.
 * @template {symbol} R
 * @param {uvd.Catalog<R>} cat
 * @returns {uvd.Catalog<R>}
 */
function createConform(cat) {
    let h = cat.__heap;
    let HEAP = h.HEAP;
    let SCR_HEAP = h.SCR_HEAP;
    let DICT = h.DICT;

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
     * @param {boolean} reify
     * @returns {boolean}
     */
    function _conform(data, typedef, reify) {
        if (typedef & ANY) {
            return true;
        }
        if (data == null) {
            return (data === null ? (typedef & NULLABLE) : (typedef & OPTIONAL)) !== 0;
        }
        if (typedef & COMPLEX) {
            let scratch = (typedef & SCRATCH) !== 0;
            let hp = scratch ? SCR_HEAP : HEAP;
            let kinds = hp.KINDS;
            let ptr = typedef & KIND_MASK;
            let header = kinds[ptr];
            let ct = header & KIND_ENUM_MASK;

            /** Fast path: K_ANY_INNER means no registry entry, just a type check */
            if (header & K_ANY_INNER) {
                if (ct === K_COLLECTION) {
                    if (header & K_ARRAY) {
                        return Array.isArray(data);
                    }
                    return typeof data === 'object' && data !== null && !Array.isArray(data);
                }
                if (ct === K_OBJECT) {
                    return typeof data === 'object' && data !== null && !Array.isArray(data);
                }
                return false;
            }

            let ri = kinds[ptr + 1];

            if (ct === K_PRIMITIVE) {
                let vm = header & SIMPLE;
                return vm !== 0 && parseValue(data, vm, reify) !== FAIL;
            }
            if (ct === K_OBJECT) {
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    return false;
                }
                let objects = hp.OBJECTS;
                let slab = hp.SLAB;
                let offset = objects[ri * 2];
                let length = objects[ri * 2 + 1];
                for (let i = 0; i < length; i++) {
                    let key = DICT.KEY_INDEX.get(slab[offset + (i * 2)]);
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
            if (ct === K_COLLECTION) {
                if (header & K_ARRAY) {
                    if (!Array.isArray(data)) {
                        return false;
                    }
                    let elemType = hp.ARRAYS[ri];
                    let length = data.length;
                    for (let i = 0; i < length; i++) {
                        if (!_parseSlot(data, i, elemType, reify)) {
                            return false;
                        }
                    }
                    return true;
                }
                /** K_RECORD */
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    return false;
                }
                let dataKeys = Object.keys(data);
                for (let i = 0; i < dataKeys.length; i++) {
                    if (!_parseSlot(data, dataKeys[i], ri, reify)) {
                        return false;
                    }
                }
                return true;
            }
            if (ct === K_COMPOSITION) {
                let matches = hp.MATCHES;
                let slab = hp.SLAB;
                let offset = matches[ri * 2];
                let count = matches[ri * 2 + 1];
                if (header & K_OR) {
                    for (let i = 0; i < count; i++) {
                        if (_conform(data, slab[offset + i], reify)) {
                            return true;
                        }
                    }
                    return false;
                }
                if (header & K_EXCLUSIVE) {
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
                /** K_INTERSECT */
                for (let i = 0; i < count; i++) {
                    if (!_conform(data, slab[offset + i], reify)) {
                        return false;
                    }
                }
                return true;
            }
            if (ct === K_UNION) {
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    return false;
                }
                let unions = hp.UNIONS;
                let slab = hp.SLAB;
                let discKey = DICT.KEY_INDEX.get(unions[ri * 3 + 2]);
                if (discKey === void 0) {
                    return false;
                }
                let valueId = DICT.KEY_DICT.get(data[discKey]);
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
            if (ct === K_TUPLE) {
                if (!Array.isArray(data)) {
                    return false;
                }
                let tuples = hp.TUPLES;
                let slab = hp.SLAB;
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
                    if (!_parseSlot(data, i, slab[offset + i], reify)) {
                        return false;
                    }
                }
                if (hasRest) {
                    let restType = (slab[offset + count - 1] & ~REST) >>> 0;
                    for (let i = fixedCount; i < data.length; i++) {
                        if (!_parseSlot(data, i, restType, reify)) {
                            return false;
                        }
                    }
                }
                return true;
            }
            if (ct === K_WRAPPER) {
                if (header & K_REFINE) {
                    return _conform(data, ri, reify);
                }
                /** K_NOT */
                return !_conform(data, ri, reify);
            }
            if (ct === K_CONDITIONAL) {
                let matches = hp.MATCHES;
                let slab = hp.SLAB;
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
        h.setRewindPending();
        return _conform(data, typedef, !preserve);
    }

    return conform;
}

export { createConform };
