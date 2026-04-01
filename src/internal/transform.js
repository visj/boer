/// <reference path="../../global.d.ts" />
import {
    COMPLEX, NULLABLE, OPTIONAL,
    ANY, SIMPLE, PRIM_MASK,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_RECORD,
    K_OR, K_EXCLUSIVE, K_INTERSECT,
    K_UNION, K_TUPLE, K_REFINE, K_NOT,
    K_CONDITIONAL, K_ANY_INNER,
    KIND_ENUM_MASK, FAIL, K_HAS_REST,
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
    let KEY_DICT = h.KEY_DICT;
    let KEY_INDEX = h.KEY_INDEX;

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
            if ((data === null ? (type & NULLABLE) : (type & OPTIONAL)) !== 0) {
                return true;
            }
            /** ANY (bit 3) without NULLABLE/OPTIONAL still accepts null/undefined */
            if ((type & COMPLEX) === 0 && (type & ANY) !== 0) {
                return true;
            }
            return false;
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
        if (data == null) {
            if ((data === null ? (typedef & NULLABLE) : (typedef & OPTIONAL)) !== 0) {
                return true;
            }
            /**
             * Primitive typedef: ANY accepts everything (including null/undefined).
             * ANY = bit 3 is safe to check here since COMPLEX = bit 0 would be 0.
             */
            if (!(typedef & COMPLEX) && (typedef & ANY)) {
                return true;
            }
            return false;
        }
        if (typedef & COMPLEX) {
            let hp = HEAP;
            let kinds = hp.KINDS;
            let kindsIdx = (typedef >>> 3) << 1;
            let header = kinds[kindsIdx];
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
                 * Fall through to K_PRIMITIVE dispatch which skips the type check.
                 */
                if (ct !== K_PRIMITIVE) {
                    return false;
                }
            }

            switch (ct) {
                case K_PRIMITIVE: {
                    let vm = header & SIMPLE;
                    /**
                     * K_ANY_INNER means the type included ANY — accept any non-null value.
                     * If VALUE bits are present, still try to coerce (e.g. string→number).
                     * If no VALUE bits (pure ANY), accept unconditionally.
                     */
                    if (header & K_ANY_INNER) {
                        if (vm === 0) { return true; }
                        return parseValue(data, vm, reify) !== FAIL;
                    }
                    return vm !== 0 && parseValue(data, vm, reify) !== FAIL;
                }
                case K_OBJECT: {
                    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                        return false;
                    }
                    let slab = hp.SLAB;
                    let slabOffset = kinds[kindsIdx + 1];
                    let length = slab[slabOffset];
                    let base = slabOffset + 1;
                    for (let i = 0; i < length; i++) {
                        let key = KEY_INDEX.get(slab[base + (i * 2)]);
                        if (key === void 0) {
                            return false;
                        }
                        let type = slab[base + (i * 2) + 1];
                        if (!_parseSlot(data, key, type, reify)) {
                            return false;
                        }
                    }
                    return true;
                }
                case K_ARRAY: {
                    if (!Array.isArray(data)) {
                        return false;
                    }
                    let elemType = kinds[kindsIdx + 1];
                    let length = data.length;
                    for (let i = 0; i < length; i++) {
                        if (!_parseSlot(data, i, elemType, reify)) {
                            return false;
                        }
                    }
                    return true;
                }
                case K_RECORD: {
                    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                        return false;
                    }
                    let valueType = kinds[kindsIdx + 1];
                    let dataKeys = Object.keys(data);
                    for (let i = 0; i < dataKeys.length; i++) {
                        if (!_parseSlot(data, dataKeys[i], valueType, reify)) {
                            return false;
                        }
                    }
                    return true;
                }
                case K_OR: {
                    let slab = hp.SLAB;
                    let slabOffset = kinds[kindsIdx + 1];
                    let count = slab[slabOffset];
                    for (let i = 0; i < count; i++) {
                        if (_conform(data, slab[slabOffset + 1 + i], reify)) {
                            return true;
                        }
                    }
                    return false;
                }
                case K_EXCLUSIVE: {
                    let slab = hp.SLAB;
                    let slabOffset = kinds[kindsIdx + 1];
                    let count = slab[slabOffset];
                    let matchCount = 0;
                    for (let i = 0; i < count; i++) {
                        if (_conform(data, slab[slabOffset + 1 + i], reify)) {
                            matchCount++;
                            if (matchCount > 1) {
                                return false;
                            }
                        }
                    }
                    return matchCount === 1;
                }
                case K_INTERSECT: {
                    let slab = hp.SLAB;
                    let slabOffset = kinds[kindsIdx + 1];
                    let count = slab[slabOffset];
                    for (let i = 0; i < count; i++) {
                        if (!_conform(data, slab[slabOffset + 1 + i], reify)) {
                            return false;
                        }
                    }
                    return true;
                }
                case K_UNION: {
                    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                        return false;
                    }
                    let slab = hp.SLAB;
                    let slabOffset = kinds[kindsIdx + 1];
                    let length = slab[slabOffset];
                    /** slab[slabOffset+1] is the discriminator keyId; variants follow at slabOffset+2 */
                    let discKey = KEY_INDEX.get(slab[slabOffset + 1]);
                    if (discKey === void 0) {
                        return false;
                    }
                    let valueId = KEY_DICT.get(data[discKey]);
                    if (valueId === void 0) {
                        return false;
                    }
                    for (let i = 0; i < length; i++) {
                        if (slab[slabOffset + 2 + i * 2] === valueId) {
                            return _conform(data, slab[slabOffset + 3 + i * 2], reify);
                        }
                    }
                    return false;
                }
                case K_TUPLE: {
                    if (!Array.isArray(data)) {
                        return false;
                    }
                    let slab = hp.SLAB;
                    let slabOffset = kinds[kindsIdx + 1];
                    let count = slab[slabOffset];
                    let hasRest = (header & K_HAS_REST) !== 0;
                    let fixedCount = hasRest ? count - 1 : count;
                    if (data.length < fixedCount) {
                        return false;
                    }
                    if (!hasRest && data.length > fixedCount) {
                        return false;
                    }
                    let base = slabOffset + 1;
                    for (let i = 0; i < fixedCount; i++) {
                        if (!_parseSlot(data, i, slab[base + i], reify)) {
                            return false;
                        }
                    }
                    if (hasRest) {
                        let restType = slab[base + count - 1];
                        for (let i = fixedCount; i < data.length; i++) {
                            if (!_parseSlot(data, i, restType, reify)) {
                                return false;
                            }
                        }
                    }
                    return true;
                }
                case K_REFINE: {
                    let slab = hp.SLAB;
                    let slabOffset = kinds[kindsIdx + 1];
                    return _conform(data, slab[slabOffset + 1], reify);
                }
                case K_NOT: {
                    return !_conform(data, kinds[kindsIdx + 1], reify);
                }
                case K_CONDITIONAL: {
                    let slab = hp.SLAB;
                    let slabOffset = kinds[kindsIdx + 1];
                    let ifType = slab[slabOffset + 1];
                    let thenType = slab[slabOffset + 2];
                    let elseType = slab[slabOffset + 3];
                    if (_conform(data, ifType, reify)) {
                        return _conform(data, thenType, reify);
                    } else {
                        return _conform(data, elseType, reify);
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
        return _conform(data, typedef, !preserve);
    }

    return conform;
}

export { createConform };
