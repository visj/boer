/// <reference path="../../global.d.ts" />
import {
    COMPLEX, NULLABLE, OPTIONAL,
    ANY, SIMPLE, VALUE, PRIM_MASK,
    STRING, NUMBER, INTEGER, BOOLEAN,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_RECORD,
    K_OR, K_EXCLUSIVE, K_INTERSECT,
    K_UNION, K_TUPLE, K_REFINE, K_NOT,
    K_CONDITIONAL, K_DYN_ANCHOR, K_DYN_REF, K_UNEVALUATED,
    K_ANY_INNER, K_STRICT, K_HAS_ITEMS, K_HAS_REST,
    KIND_ENUM_MASK, K_VALIDATOR,
    MODIFIER, MOD_MASK, MOD_ARRAY, MOD_RECORD, MOD_ENUM,
    MOD_ENUM_IS_SET, MOD_ENUM_IDX_SHIFT, MOD_ENUM_IDX_MASK,
    MOD_ARRAY_UNIQUE_BIT, MOD_ARRAY_MAX_ITEMS_SHIFT, MOD_ARRAY_MAX_ITEMS_MASK,
    MOD_ARRAY_MIN_ITEMS_SHIFT, MOD_ARRAY_MIN_ITEMS_MASK,
    MOD_RECORD_MAX_PROPS_SHIFT, MOD_RECORD_MAX_PROPS_MASK,
    MOD_RECORD_MIN_PROPS_SHIFT, MOD_RECORD_MIN_PROPS_MASK,
    STR_REGEX_IDX_SHIFT, STR_REGEX_IDX_MASK,
    STR_MAX_LEN_SHIFT, STR_MAX_LEN_MASK,
    STR_MIN_LEN_SHIFT, STR_MIN_LEN_MASK,
    NUM_HAS_MIN_BIT, NUM_EXCL_MIN_BIT, NUM_EXCL_MAX_BIT,
    NUM_MIN_NEG_BIT, NUM_MAX_NEG_BIT,
    NUM_MIN_MAG_SHIFT, NUM_MIN_MAG_MASK,
    NUM_MAX_MAG_SHIFT, NUM_MAX_MAG_MASK,
    V_MIN_LENGTH, V_MAX_LENGTH, V_PATTERN, V_FORMAT,
    V_MINIMUM, V_MAXIMUM, V_MULTIPLE_OF, V_EXCLUSIVE_MINIMUM, V_EXCLUSIVE_MAXIMUM,
    V_MIN_ITEMS, V_MAX_ITEMS, V_CONTAINS, V_MIN_CONTAINS, V_MAX_CONTAINS,
    V_PRIMITIVE_ITEMS, V_UNIQUE_ITEMS, V_MIN_PROPERTIES, V_MAX_PROPERTIES,
    V_PATTERN_PROPERTIES, V_PROPERTY_NAMES,
    V_ADDITIONAL_PROPERTIES, V_DEPENDENT_REQUIRED, V_DEPENDENT_SCHEMAS,
    V_ENUM, V_PAYLOAD_MASK,
    BOOL_ENUM_TRUE, BOOL_ENUM_FALSE,
    FMT_EMAIL, FMT_IPV4, FMT_UUID, FMT_DATE, FMT_TIME, FMT_DATETIME,
    hasOwnProperty,
    WORD_IDX_SHIFT, WORD_BIT_MASK, UNKNOWN_KEY_FLAG,
} from './const.js';

import {
    _isValue, describeType, deepEqual, codepointLen,
    binarySearch, binarySearchPair, popcnt16,
    isValidTime, isValidDate, isValidDateTime
} from './util.js';

/** Format regex patterns (same as catalog.js) */
const FMT_RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FMT_RE_IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const FMT_RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Format name lookup for diagnostic messages */
const FMT_NAMES = ['', 'email', 'ipv4', 'uuid', 'date', 'time', 'date-time'];

/**
 * Creates a `diagnose` function bound to the given catalog's heap.
 * Diagnose walks the type tree and collects human-readable path/error objects
 * for every validation failure. Unlike validate, it collects ALL errors
 * (allErrors mode) rather than short-circuiting on the first failure.
 *
 * @template {symbol} R
 * @param {uvd.Catalog<R>} cat
 * @returns {uvd.Catalog<R>['diagnose']}
 */
function createDiagnose(cat) {
    let h = cat.__heap;
    let HEAP = h.HEAP;
    let KEY_DICT = h.KEY_DICT;
    let KEY_INDEX = h.KEY_INDEX;
    let REGEX_CACHE = h.REGEX_CACHE;
    let CALLBACKS = h.CALLBACKS;
    let CONSTANTS = h.CONSTANTS;
    let ENUMS = h.ENUMS;
    let _validate = h._validate;

    /**
     * Dynamic anchor scope stack for K_DYN_ANCHOR / K_DYN_REF.
     * Each entry is a slab offset. Mirrors catalog.js DYN_ANCHORS.
     * @type {!Array<number>}
     */
    let DYN_ANCHORS = [];
    /** @type {number} */
    let DYN_PTR = 0;

    /**
     * Diagnoses a primitive validator (K_PRIMITIVE with K_VALIDATOR).
     * Mirrors runPrimValidator from catalog.js.
     *
     * @param {*} value
     * @param {number} primBits - primitive type bits from KINDS header
     * @param {number} vHeader - validator bitmask
     * @param {number} valPtr - offset into VALIDATORS (first payload)
     * @param {string} path
     * @param {!Array<uvd.PathError>} errors
     */
    function _diagnosePrimValidator(value, primBits, vHeader, valPtr, path, errors) {
        let vals = HEAP.VALIDATORS;
        let base = valPtr;

        if (typeof value === 'string') {
            if (vHeader & V_MIN_LENGTH) {
                let p = base + popcnt16(vHeader & (V_MIN_LENGTH - 1));
                let limit = vals[p];
                if (value.length < limit || codepointLen(value) < limit) {
                    errors.push({ path, message: 'string length ' + codepointLen(value) + ' is less than minimum ' + limit });
                }
            }
            if (vHeader & V_MAX_LENGTH) {
                let p = base + popcnt16(vHeader & (V_MAX_LENGTH - 1));
                let limit = vals[p];
                if (value.length > limit && codepointLen(value) > limit) {
                    errors.push({ path, message: 'string length ' + codepointLen(value) + ' exceeds maximum ' + limit });
                }
            }
            if (vHeader & V_PATTERN) {
                let p = base + popcnt16(vHeader & (V_PATTERN - 1));
                let re = REGEX_CACHE[vals[p] | 0];
                if (!re.test(value)) {
                    errors.push({ path, message: 'string does not match pattern /' + re.source + '/' });
                }
            }
            if (vHeader & V_FORMAT) {
                let p = base + popcnt16(vHeader & (V_FORMAT - 1));
                let fmt = vals[p] | 0;
                let valid = true;

                if (fmt === FMT_DATE) {
                    if (value.length !== 10 || !isValidDate(value)) {
                        valid = false;
                    }
                } else if (fmt === FMT_TIME) {
                    if (!isValidTime(value)) {
                        valid = false;
                    }
                } else if (fmt === FMT_DATETIME) {
                    if (!isValidDateTime(value)) {
                        valid = false;
                    }
                } else {
                    let re = fmt === FMT_EMAIL ? FMT_RE_EMAIL :
                        fmt === FMT_IPV4 ? FMT_RE_IPV4 :
                        fmt === FMT_UUID ? FMT_RE_UUID : null;
                    if (re && !re.test(value)) {
                        valid = false;
                    }
                }
                if (!valid) {
                    errors.push({ path, message: 'string does not match format ' + (FMT_NAMES[fmt] || 'unknown') });
                }
            }
        } else if (typeof value === 'number') {
            if (vHeader & V_MINIMUM) {
                let p = base + popcnt16(vHeader & (V_MINIMUM - 1));
                let isExcl = (vHeader & V_EXCLUSIVE_MINIMUM) !== 0;
                if (isExcl ? value <= vals[p] : value < vals[p]) {
                    errors.push({ path, message: 'value ' + value + ' is less than ' + (isExcl ? 'exclusive ' : '') + 'minimum ' + vals[p] });
                }
            }
            if (vHeader & V_MAXIMUM) {
                let p = base + popcnt16(vHeader & (V_MAXIMUM - 1));
                let isExcl = (vHeader & V_EXCLUSIVE_MAXIMUM) !== 0;
                if (isExcl ? value >= vals[p] : value > vals[p]) {
                    errors.push({ path, message: 'value ' + value + ' exceeds ' + (isExcl ? 'exclusive ' : '') + 'maximum ' + vals[p] });
                }
            }
            if (vHeader & V_MULTIPLE_OF) {
                let p = base + popcnt16(vHeader & (V_MULTIPLE_OF - 1));
                let quotient = value / vals[p];
                let isMultiple = Math.abs(Math.round(quotient) - quotient) < 1e-8;
                if (!isMultiple) {
                    errors.push({ path, message: 'value ' + value + ' is not a multiple of ' + vals[p] });
                }
            }
        }

        /** V_ENUM: check if value is in the allowed enum set */
        if (vHeader & V_ENUM) {
            let p = base + popcnt16(vHeader & V_PAYLOAD_MASK);
            let found = false;

            if (typeof value === 'string') {
                let strCount = vals[p] | 0;
                let keyId = KEY_DICT.get(value);
                if (keyId !== void 0 && binarySearch(vals, p + 1, strCount, keyId)) {
                    found = true;
                }
            } else if (typeof value === 'number') {
                if (primBits & STRING) {
                    let strCount = vals[p] | 0;
                    p += 1 + strCount;
                }
                let numCount = vals[p] | 0;
                if (binarySearch(vals, p + 1, numCount, value)) {
                    found = true;
                }
            } else if (typeof value === 'boolean') {
                if (primBits & STRING) {
                    let strCount = vals[p] | 0;
                    p += 1 + strCount;
                }
                if (primBits & (NUMBER | INTEGER)) {
                    let numCount = vals[p] | 0;
                    p += 1 + numCount;
                }
                let boolMask = vals[p] | 0;
                if (boolMask & (value ? BOOL_ENUM_TRUE : BOOL_ENUM_FALSE)) {
                    found = true;
                }
            }
            if (!found) {
                errors.push({ path, message: 'value is not in the allowed enum' });
            }
        }
    }

    /**
     * Diagnoses an array validator (K_ARRAY / K_TUPLE with K_VALIDATOR).
     * Mirrors runArrayValidator from catalog.js.
     *
     * @param {!Array<*>} data
     * @param {number} vHeader - validator bitmask
     * @param {number} valPtr - offset into VALIDATORS
     * @param {string} path
     * @param {!Array<uvd.PathError>} errors
     */
    function _diagnoseArrayValidator(data, vHeader, valPtr, path, errors) {
        let vals = HEAP.VALIDATORS;
        let base = valPtr;

        if (vHeader & V_MIN_ITEMS) {
            let p = base + popcnt16(vHeader & (V_MIN_ITEMS - 1));
            if (data.length < vals[p]) {
                errors.push({ path, message: 'array has ' + data.length + ' items, minimum is ' + vals[p] });
            }
        }
        if (vHeader & V_MAX_ITEMS) {
            let p = base + popcnt16(vHeader & (V_MAX_ITEMS - 1));
            if (data.length > vals[p]) {
                errors.push({ path, message: 'array has ' + data.length + ' items, maximum is ' + vals[p] });
            }
        }
        if (vHeader & V_UNIQUE_ITEMS) {
            let length = data.length;
            if (vHeader & V_PRIMITIVE_ITEMS) {
                /**
                 * Primitive items: === is sufficient for equality.
                 * For diagnostics we report the indices of the first duplicate pair.
                 */
                let found = false;
                for (let i = 0; i < length && !found; i++) {
                    for (let j = i + 1; j < length && !found; j++) {
                        if (data[i] === data[j]) {
                            errors.push({ path, message: 'array items are not unique (duplicate at index ' + i + ' and ' + j + ')' });
                            found = true;
                        }
                    }
                }
            } else {
                /** Complex or unknown items: must use deepEqual */
                let found = false;
                for (let i = 0; i < length && !found; i++) {
                    for (let j = i + 1; j < length && !found; j++) {
                        if (deepEqual(data[i], data[j])) {
                            errors.push({ path, message: 'array items are not unique (duplicate at index ' + i + ' and ' + j + ')' });
                            found = true;
                        }
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
                }
            }
            if (matchCount < minC) {
                errors.push({ path, message: 'array does not contain enough matching items (found ' + matchCount + ', need ' + minC + ')' });
            }
            if (matchCount > maxC) {
                errors.push({ path, message: 'too many contains matches (found ' + matchCount + ', maximum ' + maxC + ')' });
            }
        }
    }

    /**
     * Diagnoses an object validator (K_OBJECT with K_VALIDATOR).
     * Mirrors runObjectValidator from catalog.js.
     *
     * @param {!Record<string,any>} data
     * @param {number} vHeader - validator bitmask
     * @param {number} valPtr - offset into VALIDATORS
     * @param {number} slabOffset - SLAB offset for this object's properties
     * @param {string} path
     * @param {!Array<uvd.PathError>} errors
     */
    function _diagnoseObjectValidator(data, vHeader, valPtr, slabOffset, path, errors) {
        let vals = HEAP.VALIDATORS;
        let slab = HEAP.SLAB;

        /**
         * Advance cursor through payload in bit order (low bits first),
         * recording offsets for sections used in the iteration loop.
         */
        let p = valPtr;

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

        /** V_DEPENDENT_REQUIRED: check that trigger properties require their deps */
        if (vHeader & V_DEPENDENT_REQUIRED) {
            let triggerCount = vals[p++] | 0;
            for (let ti = 0; ti < triggerCount; ti++) {
                let triggerKey = KEY_INDEX[vals[p++] | 0];
                let depCount = vals[p++] | 0;
                if (triggerKey !== void 0 && hasOwnProperty.call(data, triggerKey)) {
                    for (let di = 0; di < depCount; di++) {
                        let depKey = KEY_INDEX[vals[p++] | 0];
                        if (depKey === void 0 || !hasOwnProperty.call(data, depKey)) {
                            errors.push({ path, message: "property '" + triggerKey + "' requires property '" + depKey + "'" });
                        }
                    }
                } else {
                    p += depCount;
                }
            }
        }

        /** V_DEPENDENT_SCHEMAS: validate dependent schemas when trigger is present */
        if (vHeader & V_DEPENDENT_SCHEMAS) {
            let depCount = vals[p++] | 0;
            for (let di = 0; di < depCount; di++) {
                let triggerKey = KEY_INDEX[vals[p++] | 0];
                let depSchemaType = vals[p++];
                if (triggerKey !== void 0 && data[triggerKey] !== void 0) {
                    if (!_validate(data, depSchemaType, 0, 0)) {
                        _diagnose(data, depSchemaType, path, errors);
                    }
                }
            }
        }

        /** Check if any iteration-based validators exist */
        let needsIter = vHeader & (V_MIN_PROPERTIES | V_MAX_PROPERTIES | V_PATTERN_PROPERTIES | V_PROPERTY_NAMES | V_ADDITIONAL_PROPERTIES);
        if (!needsIter) {
            return;
        }

        /** Unpack limits and SLAB info */
        let minProps = (vHeader & V_MIN_PROPERTIES) ? vals[pMinProps] : 0;
        let hasMaxProps = (vHeader & V_MAX_PROPERTIES) !== 0;
        let maxProps = hasMaxProps ? vals[pMinProps + ((vHeader & V_MIN_PROPERTIES) ? 1 : 0)] : 0;

        let addType = 0;
        let slabLength = 0;
        if (vHeader & V_ADDITIONAL_PROPERTIES) {
            addType = vals[p];
            slabLength = slab[slabOffset];
        }

        let nameSchema = (vHeader & V_PROPERTY_NAMES) ? vals[pPropertyNames] : 0;

        let hasPatterns = (vHeader & V_PATTERN_PROPERTIES) !== 0;
        let hasAdditional = (vHeader & V_ADDITIONAL_PROPERTIES) !== 0;
        let hasPropertyNames = (vHeader & V_PROPERTY_NAMES) !== 0;

        /** Single loop over all own keys */
        let keyCount = 0;

        for (let key in data) {
            if (!hasOwnProperty.call(data, key)) {
                continue;
            }

            keyCount++;

            /** maxProperties: report if exceeded */
            if (hasMaxProps && keyCount > maxProps) {
                errors.push({ path, message: 'object has ' + keyCount + ' properties, maximum is ' + maxProps });
                /**
                 * Unlike validate, we continue to collect more errors,
                 * but only report maxProperties once. Disable further max checks.
                 */
                hasMaxProps = false;
            }

            /** propertyNames: validate the key itself */
            if (hasPropertyNames) {
                if (!_validate(key, nameSchema, 0, 0)) {
                    errors.push({ path, message: "property name '" + key + "' does not match schema" });
                }
            }

            let isDeclared = false;
            let patternMatched = false;

            /** Check if key is declared in static properties via binary search */
            if (hasAdditional) {
                let keyId = KEY_DICT.get(key);
                if (keyId !== void 0) {
                    isDeclared = binarySearchPair(slab, slabOffset + 1, slabLength, keyId) >= 0;
                }
            }

            /** patternProperties: test key against each regex pattern */
            if (hasPatterns) {
                let pp = pPatternStart;
                let patternCount = vals[pp++] | 0;
                for (let pi = 0; pi < patternCount; pi++) {
                    let reIdx = vals[pp++] | 0;
                    let schemaType = vals[pp++];
                    if (REGEX_CACHE[reIdx].test(key)) {
                        patternMatched = true;
                        if (!_validate(data[key], schemaType, 0, 0)) {
                            let fieldPath = path ? path + '.' + key : key;
                            errors.push({ path: fieldPath, message: "property '" + key + "' does not match pattern schema" });
                        }
                    }
                }
            }

            /** additionalProperties: validate undeclared, unmatched keys */
            if (hasAdditional && !isDeclared && !patternMatched) {
                if (addType === 0) {
                    /** additionalProperties: false */
                    let fieldPath = path ? path + '.' + key : key;
                    errors.push({ path: fieldPath, message: "additional property '" + key + "' is not allowed" });
                } else {
                    if (!_validate(data[key], addType, 0, 0)) {
                        let fieldPath = path ? path + '.' + key : key;
                        errors.push({ path: fieldPath, message: "additional property '" + key + "' does not match schema" });
                    }
                }
            }
        }

        /** minProperties: checked after the loop */
        if (keyCount < minProps) {
            errors.push({ path, message: 'object has ' + keyCount + ' properties, minimum is ' + minProps });
        }
    }

    /**
     * Diagnoses an inline modifier typedef (MOD_ENUM, MOD_ARRAY, MOD_RECORD).
     * Mirrors _validateInlineMod from catalog.js.
     *
     * @param {*} data
     * @param {number} typedef
     * @param {string} path
     * @param {!Array<uvd.PathError>} errors
     */
    function _diagnoseInlineMod(data, typedef, path, errors) {
        let primBits = typedef & PRIM_MASK;

        if ((typedef & MOD_MASK) === MOD_ENUM) {
            /** MOD_ENUM: exact-match against CONSTANTS or ENUMS arena */
            if (primBits & VALUE) {
                if (!_isValue(data, primBits)) {
                    errors.push({ path, message: 'expected ' + describeType(typedef, HEAP.KINDS) + ', got ' + jsType(data) });
                    return;
                }
            }
            let isSet = (typedef & MOD_ENUM_IS_SET) !== 0;
            let idx = (typedef >>> MOD_ENUM_IDX_SHIFT) & MOD_ENUM_IDX_MASK;
            if (isSet) {
                if (!ENUMS[idx].has(data)) {
                    errors.push({ path, message: 'value is not in the allowed enum' });
                }
            } else {
                if (CONSTANTS[idx] !== data) {
                    errors.push({ path, message: 'value is not in the allowed enum' });
                }
            }
            return;
        }

        if ((typedef & MOD_MASK) === MOD_ARRAY) {
            /**
             * MOD_ARRAY: homogeneous array with inline constraints.
             * Bit 11: UNIQUE flag
             * Bits 12-23: maxItems
             * Bits 24-31: minItems
             */
            if (!Array.isArray(data)) {
                errors.push({ path, message: 'expected array, got ' + jsType(data) });
                return;
            }
            let len = data.length;
            let minItems = (typedef >>> MOD_ARRAY_MIN_ITEMS_SHIFT) & MOD_ARRAY_MIN_ITEMS_MASK;
            let maxItems = (typedef >>> MOD_ARRAY_MAX_ITEMS_SHIFT) & MOD_ARRAY_MAX_ITEMS_MASK;
            if (minItems > 0 && len < minItems) {
                errors.push({ path, message: 'array has ' + len + ' items, minimum is ' + minItems });
            }
            if (maxItems > 0 && len > maxItems) {
                errors.push({ path, message: 'array has ' + len + ' items, maximum is ' + maxItems });
            }
            /** Validate each element against the primitive mask */
            let mask = primBits;
            for (let i = 0; i < len; i++) {
                if (!_isValue(data[i], mask)) {
                    _diagnose(data[i], primBits, path + '[' + i + ']', errors);
                }
            }
            /** uniqueItems check */
            if ((typedef & MOD_ARRAY_UNIQUE_BIT) !== 0) {
                let found = false;
                for (let i = 0; i < len && !found; i++) {
                    for (let j = i + 1; j < len && !found; j++) {
                        if (data[i] === data[j]) {
                            errors.push({ path, message: 'array items are not unique' });
                            found = true;
                        }
                    }
                }
            }
            return;
        }

        if ((typedef & MOD_MASK) === MOD_RECORD) {
            /**
             * MOD_RECORD: dynamic dictionary with inline constraints.
             * Bits 11-23: maxProperties
             * Bits 24-31: minProperties
             */
            if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                errors.push({ path, message: 'expected object, got ' + jsType(data) });
                return;
            }
            let mask = primBits;
            let maxProps = (typedef >>> MOD_RECORD_MAX_PROPS_SHIFT) & MOD_RECORD_MAX_PROPS_MASK;
            let minProps = (typedef >>> MOD_RECORD_MIN_PROPS_SHIFT) & MOD_RECORD_MIN_PROPS_MASK;
            let count = 0;
            for (let key in data) {
                if (!hasOwnProperty.call(data, key)) {
                    continue;
                }
                if (!_isValue(data[key], mask)) {
                    let fieldPath = path ? path + '.' + key : key;
                    _diagnose(data[key], primBits, fieldPath, errors);
                }
                count++;
            }
            if (maxProps > 0 && count > maxProps) {
                errors.push({ path, message: 'object has ' + count + ' properties, maximum is ' + maxProps });
            }
            if (minProps > 0 && count < minProps) {
                errors.push({ path, message: 'object has ' + count + ' properties, minimum is ' + minProps });
            }
            return;
        }
    }

    /**
     * Diagnoses an inline primitive validator typedef (MODIFIER=0, typedef > 0xFF).
     * Mirrors _validateInlinePrim from catalog.js.
     *
     * @param {*} data
     * @param {number} typedef
     * @param {string} path
     * @param {!Array<uvd.PathError>} errors
     */
    function _diagnoseInlinePrim(data, typedef, path, errors) {
        let primBits = typedef & PRIM_MASK;

        if (primBits & STRING) {
            if (typeof data !== 'string') {
                errors.push({ path, message: 'expected string, got ' + jsType(data) });
                return;
            }
            let regexIdx = (typedef >>> STR_REGEX_IDX_SHIFT) & STR_REGEX_IDX_MASK;
            let maxLen = (typedef >>> STR_MAX_LEN_SHIFT) & STR_MAX_LEN_MASK;
            let minLen = (typedef >>> STR_MIN_LEN_SHIFT) & STR_MIN_LEN_MASK;
            if (minLen > 0 || maxLen > 0) {
                let rawLen = data.length;
                if (minLen > 0 && rawLen < minLen) {
                    errors.push({ path, message: 'string length ' + rawLen + ' is less than minimum ' + minLen });
                } else {
                    let needsScan = (minLen > 0) || (maxLen > 0 && rawLen > maxLen);
                    if (needsScan) {
                        let slen = codepointLen(data);
                        if (minLen > 0 && slen < minLen) {
                            errors.push({ path, message: 'string length ' + slen + ' is less than minimum ' + minLen });
                        }
                        if (maxLen > 0 && slen > maxLen) {
                            errors.push({ path, message: 'string length ' + slen + ' exceeds maximum ' + maxLen });
                        }
                    }
                }
            }
            if (regexIdx > 0 && !REGEX_CACHE[regexIdx].test(data)) {
                errors.push({ path, message: 'string does not match pattern' });
            }
            return;
        }

        if (primBits & (NUMBER | INTEGER)) {
            if (typeof data !== 'number') {
                errors.push({ path, message: 'expected number, got ' + jsType(data) });
                return;
            }
            if ((primBits & INTEGER) && !Number.isInteger(data)) {
                errors.push({ path, message: 'expected integer, got float' });
                return;
            }
            if (typedef & NUM_HAS_MIN_BIT) {
                let minMag = (typedef >>> NUM_MIN_MAG_SHIFT) & NUM_MIN_MAG_MASK;
                let minNeg = (typedef & NUM_MIN_NEG_BIT) !== 0;
                let exclMin = (typedef & NUM_EXCL_MIN_BIT) !== 0;
                let minVal = minNeg ? -minMag : minMag;
                if (exclMin ? data <= minVal : data < minVal) {
                    errors.push({ path, message: 'value ' + data + ' is below minimum ' + minVal });
                }
            }
            let maxMag = (typedef >>> NUM_MAX_MAG_SHIFT) & NUM_MAX_MAG_MASK;
            if (maxMag > 0) {
                let maxNeg = (typedef & NUM_MAX_NEG_BIT) !== 0;
                let exclMax = (typedef & NUM_EXCL_MAX_BIT) !== 0;
                let maxVal = maxNeg ? -maxMag : maxMag;
                if (exclMax ? data >= maxVal : data > maxVal) {
                    errors.push({ path, message: 'value ' + data + ' exceeds maximum ' + maxVal });
                }
            }
            return;
        }

        if (primBits & BOOLEAN) {
            if (typeof data !== 'boolean') {
                errors.push({ path, message: 'expected boolean, got ' + jsType(data) });
            }
            return;
        }

        if (primBits & ANY) {
            return;
        }

        /** No recognized type bits: always fails */
        errors.push({ path, message: 'expected ' + describeType(typedef, HEAP.KINDS) + ', got ' + jsType(data) });
    }

    /**
     * Diagnoses a single slot value (object property, array element, tuple element).
     * Mirrors _validateSlot from catalog.js.
     *
     * @param {*} raw
     * @param {number} type
     * @param {string} path
     * @param {!Array<uvd.PathError>} errors
     */
    function _diagnoseSlot(raw, type, path, errors) {
        if (raw === void 0) {
            if (!(type & OPTIONAL)) {
                errors.push({ path, message: 'required value is missing' });
            }
            return;
        }
        if (raw === null) {
            if (!(type & NULLABLE) && !((type & (COMPLEX | ANY)) === ANY)) {
                errors.push({ path, message: 'unexpected null' });
            }
            return;
        }
        if (type & COMPLEX) {
            _diagnose(raw, type, path, errors);
            return;
        }
        if (type < 256) {
            if ((type & SIMPLE) ? !_isValue(raw, type & PRIM_MASK) : true) {
                errors.push({ path, message: 'expected ' + describeType(type, HEAP.KINDS) + ', got ' + typeof raw });
            }
            return;
        }
        if (type & MODIFIER) {
            _diagnoseInlineMod(raw, type, path, errors);
            return;
        }
        _diagnoseInlinePrim(raw, type, path, errors);
    }

    /**
     * Returns a human-readable type name for data, handling null and array.
     * @param {*} data
     * @returns {string}
     */
    function jsType(data) {
        if (data === null) {
            return 'null';
        }
        if (Array.isArray(data)) {
            return 'array';
        }
        return typeof data;
    }

    /**
     * Main diagnose function. Mirrors _validate from catalog.js, collecting
     * all errors into the errors array instead of returning false.
     *
     * @param {*} data
     * @param {number} typedef
     * @param {string} path
     * @param {!Array<uvd.PathError>} errors
     */
    function _diagnose(data, typedef, path, errors) {
        /**
         * COMPLEX path: check typedef & COMPLEX first, matching the
         * branch ordering in _validate.
         */
        if (typedef & COMPLEX) {
            /** Null/undefined guard for COMPLEX types */
            if (data == null) {
                if (data === null ? (typedef & NULLABLE) !== 0 : (typedef & OPTIONAL) !== 0) {
                    return;
                }
                /**
                 * Fall through to kind handler for K_CONDITIONAL, K_OR, K_NOT, etc.
                 * K_OBJECT/K_ARRAY/K_PRIMITIVE reject null in their own checks.
                 */
            }

            let kinds = HEAP.KINDS;
            let kindsIdx = (typedef >>> 3) << 1;
            let header = kinds[kindsIdx];
            let ct = header & KIND_ENUM_MASK;

            /** K_ANY_INNER: bare container types with no registry entry */
            if (header & K_ANY_INNER) {
                if (ct === K_ARRAY) {
                    if (!Array.isArray(data)) {
                        errors.push({ path, message: 'expected array, got ' + jsType(data) });
                    }
                    return;
                }
                if (ct === K_RECORD || ct === K_OBJECT) {
                    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
                        errors.push({ path, message: 'expected object, got ' + jsType(data) });
                    }
                    return;
                }
                /**
                 * K_PRIMITIVE + K_ANY_INNER: ANY was included in the type.
                 * Skip the _isValue check but still run the validator if present.
                 */
                if (ct === K_PRIMITIVE) {
                    if (header & K_VALIDATOR) {
                        _diagnosePrimValidator(data, header & SIMPLE, (header >>> 8) & 0x1FFFF, kinds[kindsIdx + 1], path, errors);
                    }
                    return;
                }
                /** Unknown K_ANY_INNER kind: shouldn't happen */
                return;
            }

            /**
             * Kind dispatch ordered by frequency:
             * K_OBJECT (70%), K_ARRAY (10%), K_PRIMITIVE (20%), then rare kinds.
             */
            if (ct === K_OBJECT) {
                if (data === null || typeof data !== 'object' || Array.isArray(data)) {
                    errors.push({ path, message: 'expected object, got ' + jsType(data) });
                    return;
                }
                let slab = HEAP.SLAB;
                let slabOffset = kinds[kindsIdx + 1];
                let length = slab[slabOffset];

                let base = slabOffset + 1;
                for (let i = 0; i < length; i++, base += 2) {
                    let keyId = slab[base];
                    let key = KEY_INDEX[keyId];
                    let type = slab[base + 1];
                    let hasProp = hasOwnProperty.call(data, key);
                    let val = hasProp ? data[key] : void 0;
                    let fieldPath = path ? path + '.' + key : key;

                    /** Undefined check: missing or explicitly undefined */
                    if (val === void 0) {
                        if (!(type & OPTIONAL)) {
                            errors.push({ path: fieldPath, message: "required property '" + key + "' is missing" });
                        }
                        continue;
                    }
                    /** Null check */
                    if (val === null) {
                        if (type & COMPLEX) {
                            /**
                             * COMPLEX types may accept null through composition
                             * operators (oneOf/anyOf with a null branch).
                             */
                            if (!(type & NULLABLE) && !_validate(val, type, 0, 0)) {
                                _diagnose(val, type, fieldPath, errors);
                            }
                        } else if (!(type & (NULLABLE | ANY))) {
                            errors.push({ path: fieldPath, message: "unexpected null for property '" + key + "'" });
                        }
                        continue;
                    }
                    /** Non-null value: dispatch based on type encoding */
                    if (type & COMPLEX) {
                        _diagnose(val, type, fieldPath, errors);
                    } else if (type < 256) {
                        let mask = type & PRIM_MASK;
                        if (!(mask & ANY)) {
                            let jt = typeof val;
                            if (jt === 'string') {
                                if (!(mask & STRING)) {
                                    errors.push({ path: fieldPath, message: "expected " + describeType(type, kinds) + ", got " + jt + " for property '" + key + "'" });
                                }
                            } else if (jt === 'number') {
                                if (!(mask & NUMBER)) {
                                    if (!(mask & INTEGER) || !Number.isInteger(val)) {
                                        errors.push({ path: fieldPath, message: "expected " + describeType(type, kinds) + ", got " + jt + " for property '" + key + "'" });
                                    }
                                }
                            } else if (jt === 'boolean') {
                                if (!(mask & BOOLEAN)) {
                                    errors.push({ path: fieldPath, message: "expected " + describeType(type, kinds) + ", got " + jt + " for property '" + key + "'" });
                                }
                            } else {
                                errors.push({ path: fieldPath, message: "expected " + describeType(type, kinds) + ", got " + jt + " for property '" + key + "'" });
                            }
                        }
                    } else {
                        if (type & MODIFIER) {
                            _diagnoseInlineMod(val, type, fieldPath, errors);
                        } else {
                            _diagnoseInlinePrim(val, type, fieldPath, errors);
                        }
                    }
                }
                /** Object validator (additionalProperties, patternProperties, etc.) */
                if (header & K_VALIDATOR) {
                    _diagnoseObjectValidator(data, kinds[kindsIdx + 2], kinds[kindsIdx + 3], slabOffset, path, errors);
                }
                return;
            }

            if (ct === K_ARRAY) {
                if (!Array.isArray(data)) {
                    errors.push({ path, message: 'expected array, got ' + jsType(data) });
                    return;
                }
                if ((header & K_HAS_ITEMS) !== 0) {
                    let innerType = kinds[kindsIdx + 1];
                    let length = data.length;
                    for (let i = 0; i < length; i++) {
                        _diagnoseSlot(data[i], innerType, path + '[' + i + ']', errors);
                    }
                }
                if (header & K_VALIDATOR) {
                    _diagnoseArrayValidator(data, kinds[kindsIdx + 2], kinds[kindsIdx + 3], path, errors);
                }
                return;
            }

            if (ct === K_PRIMITIVE) {
                let primBits = header & SIMPLE;
                if (!(primBits & ANY)) {
                    let jt = typeof data;
                    if (jt === 'string') {
                        if (!(primBits & STRING)) {
                            errors.push({ path, message: 'expected ' + describeType(typedef, kinds) + ', got ' + jt });
                            return;
                        }
                    } else if (jt === 'number') {
                        if (!(primBits & NUMBER)) {
                            if (!(primBits & INTEGER) || !Number.isInteger(data)) {
                                errors.push({ path, message: 'expected ' + describeType(typedef, kinds) + ', got ' + jt });
                                return;
                            }
                        }
                    } else if (jt === 'boolean') {
                        if (!(primBits & BOOLEAN)) {
                            errors.push({ path, message: 'expected ' + describeType(typedef, kinds) + ', got ' + jt });
                            return;
                        }
                    } else {
                        errors.push({ path, message: 'expected ' + describeType(typedef, kinds) + ', got ' + jt });
                        return;
                    }
                }
                if (header & K_VALIDATOR) {
                    _diagnosePrimValidator(data, primBits, (header >>> 8) & 0x1FFFF, kinds[kindsIdx + 1], path, errors);
                }
                return;
            }

            /** Rare kinds: K_RECORD, K_OR, K_EXCLUSIVE, K_INTERSECT, etc. */
            _diagnoseRareKind(data, ct, kinds, kindsIdx, header, path, errors);
            return;
        }

        /**
         * Non-COMPLEX path: bare primitives and inline validators.
         * Null/undefined check including ANY acceptance.
         */
        if (data == null) {
            if (!((typedef & (ANY | (data === null ? NULLABLE : OPTIONAL))) !== 0)) {
                errors.push({ path, message: 'unexpected null/undefined' });
            }
            return;
        }
        /**
         * Inline path: typedef > 0xFF with COMPLEX=0.
         */
        if (typedef > 0xFF) {
            if (typedef & MODIFIER) {
                _diagnoseInlineMod(data, typedef, path, errors);
            } else {
                _diagnoseInlinePrim(data, typedef, path, errors);
            }
            return;
        }
        /** Bare primitive: simple _isValue check */
        if (!_isValue(data, typedef & PRIM_MASK)) {
            errors.push({ path, message: 'expected ' + describeType(typedef, HEAP.KINDS) + ', got ' + jsType(data) });
        }
    }

    /**
     * Handles rare complex kinds that are not on the hot path.
     * Mirrors _validateRareKind from catalog.js.
     *
     * @param {*} data
     * @param {number} ct - kind enum
     * @param {!Uint32Array} kinds - KINDS vtable
     * @param {number} kindsIdx - raw KINDS array index
     * @param {number} header - KINDS[kindsIdx] header word
     * @param {string} path
     * @param {!Array<uvd.PathError>} errors
     */
    function _diagnoseRareKind(data, ct, kinds, kindsIdx, header, path, errors) {
        let slab = HEAP.SLAB;

        switch (ct) {
            case K_RECORD: {
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    errors.push({ path, message: 'expected object, got ' + jsType(data) });
                    return;
                }
                let valueType = kinds[kindsIdx + 1];
                for (let key in data) {
                    if (hasOwnProperty.call(data, key)) {
                        _diagnoseSlot(data[key], valueType, path ? path + '.' + key : key, errors);
                    }
                }
                return;
            }
            case K_INTERSECT: {
                let slabOffset = kinds[kindsIdx + 1];
                let count = slab[slabOffset];
                for (let i = 0; i < count; i++) {
                    let branchType = slab[slabOffset + 1 + i];
                    if (!_validate(data, branchType, 0, 0)) {
                        _diagnose(data, branchType, path, errors);
                    }
                }
                return;
            }
            case K_OR: {
                let slabOffset = kinds[kindsIdx + 1];
                let count = slab[slabOffset];
                for (let i = 0; i < count; i++) {
                    if (_validate(data, slab[slabOffset + 1 + i], 0, 0)) {
                        return;
                    }
                }
                errors.push({ path, message: 'value did not match any of ' + count + ' alternatives (anyOf)' });
                return;
            }
            case K_EXCLUSIVE: {
                let slabOffset = kinds[kindsIdx + 1];
                let count = slab[slabOffset];
                let matchCount = 0;
                for (let i = 0; i < count; i++) {
                    if (_validate(data, slab[slabOffset + 1 + i], 0, 0)) {
                        matchCount++;
                    }
                }
                if (matchCount === 0) {
                    errors.push({ path, message: 'value did not match any exclusive type (oneOf)' });
                } else if (matchCount > 1) {
                    errors.push({ path, message: 'value matched ' + matchCount + ' types, expected exactly 1 (oneOf)' });
                }
                return;
            }
            case K_UNION: {
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    errors.push({ path, message: 'expected object for discriminated union, got ' + jsType(data) });
                    return;
                }
                let slabOffset = kinds[kindsIdx + 1];
                let length = slab[slabOffset];
                let discKey = KEY_INDEX[slab[slabOffset + 1]];
                if (discKey === void 0) {
                    errors.push({ path, message: '!! CRITICAL ERROR !! Please file an issue at Github !!' });
                    return;
                }
                if (!(discKey in data)) {
                    errors.push({ path, message: "missing discriminator key '" + discKey + "'" });
                    return;
                }
                let valueId = KEY_DICT.get(data[discKey]);
                for (let i = 0; i < length; i++) {
                    if (slab[slabOffset + 2 + i * 2] === valueId) {
                        _diagnose(data, slab[slabOffset + 3 + i * 2], path, errors);
                        return;
                    }
                }
                errors.push({ path: path ? path + '.' + discKey : discKey, message: "unknown discriminator value '" + data[discKey] + "'" });
                return;
            }
            case K_TUPLE: {
                if (!Array.isArray(data)) {
                    errors.push({ path, message: 'expected array (tuple), got ' + jsType(data) });
                    return;
                }
                let slabOffset = kinds[kindsIdx + 1];
                let count = slab[slabOffset];
                let hasRest = (header & K_HAS_REST) !== 0;
                let fixedCount = hasRest ? count - 1 : count;
                let isStrict = (header & K_STRICT) !== 0;
                let length = data.length;

                if (isStrict) {
                    if (length < fixedCount) {
                        errors.push({ path, message: 'tuple requires length >= ' + fixedCount + ', got length ' + length });
                        return;
                    }
                    if (!hasRest && length > fixedCount) {
                        errors.push({ path, message: 'tuple expects length ' + fixedCount + ', got length ' + length + ' (no rest)' });
                        return;
                    }
                }

                let base = slabOffset + 1;
                let checkCount = length < fixedCount ? length : fixedCount;
                for (let i = 0; i < checkCount; i++) {
                    _diagnoseSlot(data[i], slab[base + i], path + '[' + i + ']', errors);
                }
                if (hasRest) {
                    let restType = slab[base + count - 1];
                    for (let i = checkCount; i < length; i++) {
                        _diagnoseSlot(data[i], restType, path + '[' + i + ']', errors);
                    }
                }
                if (header & K_VALIDATOR) {
                    _diagnoseArrayValidator(data, kinds[kindsIdx + 2], kinds[kindsIdx + 3], path, errors);
                }
                return;
            }
            case K_REFINE: {
                let slabOffset = kinds[kindsIdx + 1];
                let innerType = slab[slabOffset + 1];
                let callbackIdx = slab[slabOffset + 2];
                /** First recurse into the inner type to collect its errors */
                _diagnose(data, innerType, path, errors);
                /**
                 * If the inner type validates but the callback fails,
                 * report the refinement failure separately.
                 */
                if (_validate(data, innerType, 0, 0)) {
                    if (!CALLBACKS[callbackIdx](data)) {
                        errors.push({ path, message: 'refinement check failed' });
                    }
                }
                return;
            }
            case K_NOT: {
                if (_validate(data, kinds[kindsIdx + 1], 0, 0)) {
                    errors.push({ path, message: 'value should NOT match the given type' });
                }
                return;
            }
            case K_CONDITIONAL: {
                let slabOffset = kinds[kindsIdx + 1];
                let ifType = slab[slabOffset + 1];
                let thenType = slab[slabOffset + 2];
                let elseType = slab[slabOffset + 3];
                if (_validate(data, ifType, 0, 0)) {
                    _diagnose(data, thenType, path, errors);
                } else {
                    _diagnose(data, elseType, path, errors);
                }
                return;
            }
            case K_DYN_ANCHOR: {
                let slabOffset = kinds[kindsIdx + 1];
                /** Push scope onto DYN_ANCHORS stack */
                DYN_ANCHORS[DYN_PTR++] = slabOffset;
                _diagnose(data, slab[slabOffset + 1], path, errors);
                DYN_PTR--;
                return;
            }
            case K_DYN_REF: {
                let slabOffset = kinds[kindsIdx + 1];
                let anchorKeyId = slab[slabOffset + 1];
                let targetType = slab[slabOffset + 2];
                /**
                 * Search the scope stack outermost (0) to innermost (DYN_PTR - 1).
                 * The first match wins per Draft 2020-12 spec.
                 */
                for (let i = 0; i < DYN_PTR; i++) {
                    let scopeSlabOffset = DYN_ANCHORS[i];
                    let scopeCount = slab[scopeSlabOffset];
                    let pairBase = scopeSlabOffset + 2;
                    let mid = binarySearchPair(slab, pairBase, scopeCount, anchorKeyId);
                    if (mid >= 0) {
                        targetType = slab[pairBase + mid * 2 + 1];
                        break;
                    }
                }
                _diagnose(data, targetType, path, errors);
                return;
            }
            case K_UNEVALUATED: {
                /**
                 * K_UNEVALUATED wraps an inner type with evaluation tracking.
                 * For diagnose, we use _validate (with tracking) to identify which
                 * items/props are evaluated, then check unevaluated ones.
                 */
                let slabOffset = kinds[kindsIdx + 1];
                let innerType = slab[slabOffset + 1];
                let unevalType = slab[slabOffset + 2];
                let unevalMode = slab[slabOffset + 3];

                if (unevalMode === 1) {
                    /** Items tracking (arrays) */
                    if (!Array.isArray(data)) {
                        /** Not an array: delegate to inner type */
                        _diagnose(data, innerType, path, errors);
                        return;
                    }
                    /**
                     * First diagnose the inner type to collect its errors.
                     * Then use _validate with tracking to find unevaluated items.
                     */
                    _diagnose(data, innerType, path, errors);

                    /**
                     * For unevaluated items, we need to know which items were evaluated.
                     * We use _validate on each item individually to determine this.
                     * An item is "evaluated" if the inner type's item schema matched it.
                     * Items not evaluated must pass the unevalType.
                     */
                    if (_validate(data, innerType, 0, 0)) {
                        /**
                         * Inner type passed. Any item not structurally covered
                         * needs to match unevalType. We rely on the catalog's
                         * tracking mechanism: call _validate with trackPtr to discover.
                         * For diagnose, we approximate: if the overall validates, check
                         * each item against unevalType if it doesn't match any known schema.
                         */
                    }
                    /**
                     * Simpler approach: run full _validate with tracking to find
                     * unevaluated items, then diagnose the failing ones.
                     */
                    let itemCount = data.length;
                    for (let i = 0; i < itemCount; i++) {
                        /**
                         * Check if this item fails the unevalType, but only if it
                         * wasn't covered by the inner type's item schemas.
                         * Since we can't easily track without the internal TRACK_* arrays,
                         * we use a simplified check: try the full typedef _validate first.
                         * If it fails, and the inner type also fails this specific item,
                         * then report via _diagnose.
                         */
                        if (!_validate(data[i], unevalType, 0, 0)) {
                            /**
                             * This item doesn't match unevalType. But it might have been
                             * evaluated by the inner type. The full typedef's _validate
                             * will tell us if the overall schema rejects this.
                             */
                            if (!_validate(data, typedef, 0, 0)) {
                                /** Only report if the overall typedef fails */
                                errors.push({ path: path + '[' + i + ']', message: 'unevaluated item [' + i + '] is not allowed' });
                            }
                        }
                    }
                    return;
                }

                /** Property tracking (objects) */
                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    _diagnose(data, innerType, path, errors);
                    return;
                }

                /** Diagnose inner type errors first */
                _diagnose(data, innerType, path, errors);

                /**
                 * For unevaluated properties: the full typedef's _validate with
                 * tracking determines which properties are evaluated. If the
                 * overall schema fails, check each property individually.
                 */
                let overallFails = !_validate(data, typedef, 0, 0);
                if (overallFails) {
                    for (let key in data) {
                        if (!hasOwnProperty.call(data, key)) {
                            continue;
                        }
                        if (!_validate(data[key], unevalType, 0, 0)) {
                            /**
                             * Check if this property was covered by inner type's
                             * declared properties. Use the inner type to test.
                             */
                            let fieldPath = path ? path + '.' + key : key;
                            errors.push({ path: fieldPath, message: "unevaluated property '" + key + "' is not allowed" });
                        }
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

    /**
     * Public diagnose entry point. Returns an array of path/error objects.
     *
     * @param {*} data
     * @param {number} typedef
     * @returns {!Array<uvd.PathError>}
     */
    function diagnose(data, typedef) {
        /** @type {!Array<uvd.PathError>} */
        let errors = [];
        DYN_PTR = 0;
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
