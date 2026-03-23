/// <reference path="../../global.d.ts" />
import {
    COMPLEX, NULLABLE, OPTIONAL, SCRATCH,
    ANY, REST, SIMPLE, PRIM_MASK, KIND_MASK,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_RECORD,
    K_OR, K_EXCLUSIVE, K_INTERSECT,
    K_UNION, K_TUPLE, K_REFINE, K_NOT,
    K_CONDITIONAL, K_ANY_INNER,
    KIND_ENUM_MASK,
} from './const.js';
import { _isValue, describeType } from './util.js';

/**
 * Creates a `diagnose` function bound to the given catalog's heap.
 * Diagnose walks the type tree and collects human-readable path errors.
 * @template {symbol} R
 * @param {uvd.Catalog<R>} cat
 * @returns {uvd.Catalog<R>['diagnose']}
 */
function createDiagnose(cat) {
    let h = cat.__heap;
    let HEAP = h.HEAP;
    let SCR_HEAP = h.SCR_HEAP;
    let DICT = h.DICT;
    let _validate = h._validate;

    /**
     * @param {*} data
     * @param {number} typedef
     * @param {string} path
     * @param {!Array<uvd.PathError>} errors
     * @returns {void}
     */
    function _diagnose(data, typedef, path, errors) {
        const kinds = (typedef & SCRATCH) === 0 ? HEAP.KINDS : SCR_HEAP.KINDS;
        if (data === void 0) {
            if (!(typedef & OPTIONAL)) {
                errors.push({ path, message: 'unexpected undefined, expected ' + describeType(typedef, kinds) });
            }
            return;
        }
        if (data === null) {
            if (!(typedef & NULLABLE)) {
                errors.push({ path, message: 'unexpected null, expected ' + describeType(typedef, kinds) });
            }
            return;
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
                if (ct === K_ARRAY) {
                    if (!Array.isArray(data)) {
                        errors.push({ path, message: 'expected array, got ' + typeof data });
                    }
                } else if (ct === K_RECORD || ct === K_OBJECT) {
                    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                        errors.push({ path, message: 'expected object, got ' + typeof data });
                    }
                }
                return;
            }

            let ri = kinds[ptr + 1];

            switch (ct) {
                case K_PRIMITIVE: {
                    let primBits = header & SIMPLE;
                    if (primBits === 0 || !_isValue(data, primBits)) {
                        /** @type {string} */
                        let type = typeof data;
                        if (type === 'object') {
                            if (data instanceof Date) {
                                type = 'Date';
                            } else if (data instanceof URL) {
                                type = 'URL';
                            }
                        }
                        errors.push({ path, message: 'expected ' + describeType(typedef, kinds) + ', got ' + type });
                    }
                    return;
                }
                case K_OBJECT: {
                    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                        errors.push({ path, message: 'expected object, got ' + typeof data });
                        return;
                    }
                    let shapes = hp.SHAPES;
                    let slab = hp.SLAB;
                    let offset = shapes[ri * 2];
                    let length = shapes[ri * 2 + 1];
                    for (let i = 0; i < length; i++) {
                        let key = DICT.KEY_INDEX.get(slab[offset + (i * 2)]);
                        if (key === void 0) {
                            errors.push({ path, message: '!! CRITICAL ERROR !! Please file an issue at Github !!' });
                            return;
                        }
                        let type = slab[offset + (i * 2) + 1];
                        let fieldPath = path + (path ? '.' : '') + key;
                        _diagnose(data[key], type, fieldPath, errors);
                    }
                    return;
                }
                case K_ARRAY: {
                    if (!Array.isArray(data)) {
                        errors.push({ path, message: 'expected array, got ' + typeof data });
                        return;
                    }
                    let itemType = ri;
                    let length = data.length;
                    for (let i = 0; i < length; i++) {
                        _diagnose(data[i], itemType, path + '[' + i + ']', errors);
                    }
                    return;
                }
                case K_RECORD: {
                    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                        errors.push({ path, message: 'expected object (record), got ' + typeof data });
                        return;
                    }
                    let dataKeys = Object.keys(data);
                    for (let i = 0; i < dataKeys.length; i++) {
                        _diagnose(data[dataKeys[i]], ri, path + (path ? '.' : '') + dataKeys[i], errors);
                    }
                    return;
                }
                case K_OR: {
                    let shapes = hp.SHAPES;
                    let slab = hp.SLAB;
                    let offset = shapes[ri * 2];
                    let count = shapes[ri * 2 + 1];
                    for (let i = 0; i < count; i++) {
                        if (_validate(data, slab[offset + i])) {
                            return;
                        }
                    }
                    errors.push({ path, message: 'value did not match any of the expected types' });
                    return;
                }
                case K_EXCLUSIVE: {
                    let shapes = hp.SHAPES;
                    let slab = hp.SLAB;
                    let offset = shapes[ri * 2];
                    let count = shapes[ri * 2 + 1];
                    let matchCount = 0;
                    for (let i = 0; i < count; i++) {
                        if (_validate(data, slab[offset + i])) {
                            matchCount++;
                        }
                    }
                    if (matchCount === 0) {
                        errors.push({ path, message: 'value did not match any of the exclusive types' });
                    } else if (matchCount > 1) {
                        errors.push({ path, message: 'value matched ' + matchCount + ' types, expected exactly 1' });
                    }
                    return;
                }
                case K_INTERSECT: {
                    let shapes = hp.SHAPES;
                    let slab = hp.SLAB;
                    let offset = shapes[ri * 2];
                    let count = shapes[ri * 2 + 1];
                    for (let i = 0; i < count; i++) {
                        if (!_validate(data, slab[offset + i])) {
                            _diagnose(data, slab[offset + i], path, errors);
                        }
                    }
                    return;
                }
                case K_UNION: {
                    let shapes = hp.SHAPES;
                    let slab = hp.SLAB;
                    let offset = shapes[ri * 2];
                    let length = shapes[ri * 2 + 1];
                    // slab[offset] is the discriminator key id; variants follow at offset+1
                    let discKey = DICT.KEY_INDEX.get(slab[offset]);
                    if (discKey === void 0) {
                        errors.push({ path, message: '!! CRITICAL ERROR !! Please file an issue at Github !!' });
                        return;
                    }
                    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                        errors.push({ path, message: 'expected object for discriminated union, got ' + typeof data });
                        return;
                    }
                    if (!(discKey in data)) {
                        errors.push({ path, message: 'missing discriminator key "' + discKey + '"' });
                        return;
                    }
                    let valueId = DICT.KEY_DICT.get(data[discKey]);
                    for (let i = 0; i < length; i++) {
                        if (slab[offset + 1 + i * 2] === valueId) {
                            _diagnose(data, slab[offset + 2 + i * 2], path, errors);
                            return;
                        }
                    }
                    errors.push({ path: path + (path ? '.' : '') + discKey, message: 'unknown discriminator value "' + data[discKey] + '"' });
                    return;
                }
                case K_TUPLE: {
                    if (!Array.isArray(data)) {
                        errors.push({ path, message: 'expected tuple, got ' + typeof data });
                        return;
                    }
                    let shapes = hp.SHAPES;
                    let slab = hp.SLAB;
                    let offset = shapes[ri * 2];
                    let count = shapes[ri * 2 + 1];
                    let hasRest = count > 0 && (slab[offset + count - 1] & REST) !== 0;
                    let fixedCount = hasRest ? count - 1 : count;
                    if (data.length < fixedCount) {
                        errors.push({ path, message: 'expected tuple of length >= ' + fixedCount + ', got length ' + data.length });
                        return;
                    }
                    if (!hasRest && data.length > fixedCount) {
                        errors.push({ path, message: 'expected tuple of length ' + fixedCount + ', got length ' + data.length });
                        return;
                    }
                    for (let i = 0; i < fixedCount; i++) {
                        _diagnose(data[i], slab[offset + i], path + '[' + i + ']', errors);
                    }
                    if (hasRest) {
                        let restType = (slab[offset + count - 1] & ~REST) >>> 0;
                        for (let i = fixedCount; i < data.length; i++) {
                            _diagnose(data[i], restType, path + '[' + i + ']', errors);
                        }
                    }
                    return;
                }
                case K_REFINE: {
                    let shapes = hp.SHAPES;
                    let slab = hp.SLAB;
                    let offset = shapes[ri * 2];
                    _diagnose(data, slab[offset], path, errors);
                    return;
                }
                case K_NOT: {
                    if (_validate(data, ri)) {
                        errors.push({ path, message: 'value should NOT match the given type' });
                    }
                    return;
                }
                case K_CONDITIONAL: {
                    let shapes = hp.SHAPES;
                    let slab = hp.SLAB;
                    let offset = shapes[ri * 2];
                    let ifType = slab[offset];
                    let thenType = slab[offset + 1];
                    let elseType = slab[offset + 2];
                    if (_validate(data, ifType)) {
                        if (thenType !== 0) {
                            _diagnose(data, thenType, path, errors);
                        }
                    } else {
                        if (elseType !== 0) {
                            _diagnose(data, elseType, path, errors);
                        }
                    }
                    return;
                }
                default: {
                    errors.push({ path, message: 'invalid type definition (unknown complex kind)' });
                    return;
                }
            }
        }
        let valueMask = typedef & PRIM_MASK;
        if (valueMask === 0) {
            errors.push({ path, message: 'invalid type definition (no type bits set)' });
            return;
        }
        if (!_isValue(data, valueMask)) {
            /** @type {string} */
            let type = typeof data;
            if (type === 'object') {
                if (data instanceof Date) {
                    type = 'Date';
                } else if (data instanceof URL) {
                    type = 'URL';
                }
            }
            errors.push({ path, message: 'expected ' + describeType(typedef, kinds) + ', got ' + type });
        }
    }

    /**
     * @param {*} data
     * @param {number} typedef
     * @returns {!Array<uvd.PathError>}
     */
    function diagnose(data, typedef) {
        h.setRewindPending();
        /** @type {!Array<uvd.PathError>} */
        let errors = [];
        _diagnose(data, typedef, '', errors);
        return errors;
    }

    return diagnose;
}

// --- Assertion utilities ---

/**
 * @type {!Array<string>}
 */
const ERROR_MESSAGES = [
    'array element type must be a number typedef',
    'config field must be a number',
]

const ERR_ARRAY_ELEMENT_MUST_BE_NUMBER = 0;
const ERR_CONFIG_FIELD_MUST_BE_NUMBER = 1;

/**
 * @throws
 * @template T
 * @param {any} value
 * @param {(v: any) => v is T} predicate
 * @param {number} errorId
 * @returns {asserts value is T}
 */
function assert(value, predicate, errorId) {
    if (!predicate(value)) {
        throw new Error(ERROR_MESSAGES[errorId]);
    }
}

/**
 * @throws
 * @param {any} value
 * @param {number} errorId
 * @returns {asserts value is number}
 */
function assertIsNumber(value, errorId) {
    if (typeof value !== 'number') {
        throw new Error(ERROR_MESSAGES[errorId]);
    }
}

/**
 * @throws
 * @param {any} value
 * @param {number} errorId
 * @returns {asserts value is number}
 */
function assertIsObject(value, errorId) {
    if (value === null || typeof value !== 'object') {
        throw new Error(ERROR_MESSAGES[errorId]);
    }
}

export {
    createDiagnose,
    assert, assertIsNumber, assertIsObject,
    ERR_ARRAY_ELEMENT_MUST_BE_NUMBER,
    ERR_CONFIG_FIELD_MUST_BE_NUMBER
}
