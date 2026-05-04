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
    _isValue, describeType, deepEqual, codepointLen,
    binarySearch, binarySearchPair, popcnt16,
    isValidTime, isValidDate, isValidDateTime
} from '@boer/core';

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
 * This implementation is fully self-contained — it never calls `_validate`.
 * Where a boolean result is needed (e.g. anyOf branch testing), it uses
 * `_diagnose` with a temporary errors array and checks `tempErrors.length === 0`.
 *
 * @template {symbol} R
 * @param {boer.Catalog<R>} cat
 * @returns {(data: any, typedef: number) => boer.PathError[]}
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

    /**
     * Dynamic anchor scope stack for K_DYN_ANCHOR / K_DYN_REF.
     * Each entry is a slab offset. Mirrors catalog.js DYN_ANCHORS.
     * @type {!Array<number>}
     */
    let DYN_ANCHORS = [];
    /** @type {number} */
    let DYN_PTR = 0;

    /**
     * Tests whether data passes a typedef by running _diagnose with a
     * temporary errors array. Returns true if no errors were produced.
     * Used wherever validate needs a boolean result (anyOf branch testing,
     * not checks, if/then/else conditions, etc.)
     *
     * @param {*} data
     * @param {number} typedef
     * @param {string} path
     * @returns {boolean}
     */
    function _passes(data, typedef, path) {
        /** @type {!Array<boer.PathError>} */
        let tempErrors = [];
        _diagnose(data, typedef, path, tempErrors);
        return tempErrors.length === 0;
    }

    /**
     * Diagnoses a primitive validator (K_PRIMITIVE with K_VALIDATOR).
     * Mirrors runPrimValidator from catalog.js.
     *
     * @param {*} value
     * @param {number} primBits - primitive type bits from KINDS header
     * @param {number} vHeader - validator bitmask
     * @param {number} valPtr - offset into VALIDATORS (first payload)
     * @param {string} path
     * @param {!Array<boer.PathError>} errors
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
     * Mirrors runArrayValidator from catalog.js. Fully self-contained:
     * uses _passes instead of _validate for contains checks.
     *
     * @param {!Array<*>} data
     * @param {number} vHeader - validator bitmask
     * @param {number} valPtr - offset into VALIDATORS
     * @param {string} path
     * @param {!Array<boer.PathError>} errors
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
                /** Use _passes instead of _validate for self-contained checking */
                if (_passes(data[i], containsType, path + '[' + i + ']')) {
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
     * Mirrors runObjectValidator from catalog.js. Fully self-contained:
     * uses _diagnose and _passes instead of _validate throughout.
     *
     * @param {!Record<string,any>} data
     * @param {number} vHeader - validator bitmask
     * @param {number} valPtr - offset into VALIDATORS
     * @param {number} slabOffset - SLAB offset for this object's properties
     * @param {string} path
     * @param {!Array<boer.PathError>} errors
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

        /**
         * V_DEPENDENT_SCHEMAS: validate dependent schemas when trigger is present.
         * Uses _diagnose directly instead of _validate — collects all errors
         * from the dependent schema into the main errors array.
         */
        if (vHeader & V_DEPENDENT_SCHEMAS) {
            let depCount = vals[p++] | 0;
            for (let di = 0; di < depCount; di++) {
                let triggerKey = KEY_INDEX[vals[p++] | 0];
                let depSchemaType = vals[p++];
                if (triggerKey !== void 0 && data[triggerKey] !== void 0) {
                    _diagnose(data, depSchemaType, path, errors);
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

            /**
             * propertyNames: validate the key itself against the name schema.
             * Uses _passes instead of _validate for self-contained checking.
             */
            if (hasPropertyNames) {
                if (!_passes(key, nameSchema, path)) {
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

            /**
             * patternProperties: test key against each regex pattern.
             * Uses _diagnose directly to collect deep errors from matching patterns.
             */
            if (hasPatterns) {
                let pp = pPatternStart;
                let patternCount = vals[pp++] | 0;
                for (let pi = 0; pi < patternCount; pi++) {
                    let reIdx = vals[pp++] | 0;
                    let schemaType = vals[pp++];
                    if (REGEX_CACHE[reIdx].test(key)) {
                        patternMatched = true;
                        let fieldPath = path ? path + '.' + key : key;
                        _diagnose(data[key], schemaType, fieldPath, errors);
                    }
                }
            }

            /**
             * additionalProperties: validate undeclared, unmatched keys.
             * Uses _diagnose directly to collect deep errors.
             */
            if (hasAdditional && !isDeclared && !patternMatched) {
                if (addType === 0) {
                    /** additionalProperties: false */
                    let fieldPath = path ? path + '.' + key : key;
                    errors.push({ path: fieldPath, message: "additional property '" + key + "' is not allowed" });
                } else {
                    let fieldPath = path ? path + '.' + key : key;
                    _diagnose(data[key], addType, fieldPath, errors);
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
     * @param {!Array<boer.PathError>} errors
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
     * @param {!Array<boer.PathError>} errors
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
     * @param {!Array<boer.PathError>} errors
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
     * Collects all property keys that a type structurally declares as "evaluated".
     * Used by K_UNEVALUATED to determine which properties are covered by the
     * inner type's structural keywords without needing the TRACK_* mechanism.
     *
     * For object types, declared properties are added to the set. For composition
     * types (allOf, anyOf, oneOf, if/then/else), the function recurses into
     * children and unions the results.
     *
     * @param {*} data - the actual data being validated (needed for conditional checks)
     * @param {number} typedef - the type to walk
     * @param {!Set<string>} result - accumulator set of evaluated key strings
     */
    function _collectEvaluatedKeys(data, typedef, result) {
        /**
         * Non-COMPLEX types: check for inline MOD_RECORD which evaluates
         * all keys since it provides a schema for every property.
         */
        if (!(typedef & COMPLEX)) {
            if ((typedef & MODIFIER) && (typedef & MOD_MASK) === MOD_RECORD) {
                if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
                    for (let key in data) {
                        if (hasOwnProperty.call(data, key)) {
                            result.add(key);
                        }
                    }
                }
            }
            return;
        }
        let kinds = HEAP.KINDS;
        let slab = HEAP.SLAB;
        let kindsIdx = (typedef >>> 3) << 1;
        let header = kinds[kindsIdx];
        let ct = header & KIND_ENUM_MASK;

        /**
         * K_ANY_INNER objects/arrays/records are bare container type checks
         * (e.g. type:"object") that don't evaluate individual properties or items.
         * They must not contribute to the evaluated set.
         */
        if (header & K_ANY_INNER) {
            return;
        }

        if (ct === K_OBJECT) {
            /** All declared property keys are evaluated */
            let slabOffset = kinds[kindsIdx + 1];
            let length = slab[slabOffset];
            let base = slabOffset + 1;
            for (let i = 0; i < length; i++) {
                let keyId = slab[base + i * 2];
                let key = KEY_INDEX[keyId];
                if (key !== void 0) {
                    result.add(key);
                }
            }
            /**
             * If the object has a validator with additionalProperties or patternProperties,
             * those cover additional keys too.
             */
            if (header & K_VALIDATOR) {
                let vHeader = kinds[kindsIdx + 2];
                if (vHeader & V_ADDITIONAL_PROPERTIES) {
                    /**
                     * additionalProperties covers ALL remaining keys (even if false,
                     * because "false" means they're evaluated-and-rejected).
                     */
                    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
                        for (let key in data) {
                            if (hasOwnProperty.call(data, key)) {
                                result.add(key);
                            }
                        }
                    }
                }
                if (vHeader & V_PATTERN_PROPERTIES) {
                    /**
                     * Pattern properties evaluate any key matching the patterns.
                     */
                    let vals = HEAP.VALIDATORS;
                    let valPtr = kinds[kindsIdx + 3];
                    /** Skip past min/maxProperties to reach pattern payload */
                    let pp = valPtr;
                    if (vHeader & V_MIN_PROPERTIES) {
                        pp++;
                    }
                    if (vHeader & V_MAX_PROPERTIES) {
                        pp++;
                    }
                    let patternCount = vals[pp++] | 0;
                    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
                        for (let key in data) {
                            if (!hasOwnProperty.call(data, key)) {
                                continue;
                            }
                            for (let pi = 0; pi < patternCount; pi++) {
                                let reIdx = vals[pp + pi * 2] | 0;
                                if (REGEX_CACHE[reIdx].test(key)) {
                                    result.add(key);
                                    break;
                                }
                            }
                        }
                    }
                }
                /**
                 * V_DEPENDENT_SCHEMAS: when a trigger key is present in data,
                 * the dependent schema structurally evaluates additional keys.
                 * Walk the validator payload to find dependent schemas and
                 * recursively collect their evaluated keys.
                 */
                if (vHeader & V_DEPENDENT_SCHEMAS) {
                    let vals = HEAP.VALIDATORS;
                    let valPtr = kinds[kindsIdx + 3];
                    /**
                     * Walk the payload in bit order to reach the dependent schemas
                     * section. Must skip past all earlier sections.
                     */
                    let dp = valPtr;
                    if (vHeader & V_MIN_PROPERTIES) {
                        dp++;
                    }
                    if (vHeader & V_MAX_PROPERTIES) {
                        dp++;
                    }
                    if (vHeader & V_PATTERN_PROPERTIES) {
                        let patternCount = vals[dp++] | 0;
                        dp += patternCount * 2;
                    }
                    if (vHeader & V_PROPERTY_NAMES) {
                        dp++;
                    }
                    if (vHeader & V_DEPENDENT_REQUIRED) {
                        let triggerCount = vals[dp++] | 0;
                        for (let ti = 0; ti < triggerCount; ti++) {
                            dp++; // triggerKeyId
                            let depCount = vals[dp++] | 0;
                            dp += depCount; // skip dep keyIds
                        }
                    }
                    /** Now at V_DEPENDENT_SCHEMAS payload */
                    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
                        let depCount = vals[dp++] | 0;
                        for (let di = 0; di < depCount; di++) {
                            let triggerKey = KEY_INDEX[vals[dp++] | 0];
                            let depSchemaType = vals[dp++];
                            if (triggerKey !== void 0 && data[triggerKey] !== void 0) {
                                _collectEvaluatedKeys(data, depSchemaType, result);
                            }
                        }
                    }
                }
            }
            return;
        }

        if (ct === K_INTERSECT) {
            /** allOf: union of evaluated keys from all branches */
            let slabOffset = kinds[kindsIdx + 1];
            let count = slab[slabOffset];
            for (let i = 0; i < count; i++) {
                _collectEvaluatedKeys(data, slab[slabOffset + 1 + i], result);
            }
            return;
        }

        if (ct === K_OR) {
            /**
             * anyOf: per JSON Schema spec, annotations from all passing
             * branches are collected. Union of evaluated keys from passing branches.
             */
            let slabOffset = kinds[kindsIdx + 1];
            let count = slab[slabOffset];
            for (let i = 0; i < count; i++) {
                let branchType = slab[slabOffset + 1 + i];
                if (_passes(data, branchType, '')) {
                    _collectEvaluatedKeys(data, branchType, result);
                }
            }
            return;
        }

        if (ct === K_EXCLUSIVE) {
            /** oneOf: evaluated keys from the single passing branch */
            let slabOffset = kinds[kindsIdx + 1];
            let count = slab[slabOffset];
            for (let i = 0; i < count; i++) {
                let branchType = slab[slabOffset + 1 + i];
                if (_passes(data, branchType, '')) {
                    _collectEvaluatedKeys(data, branchType, result);
                    break;
                }
            }
            return;
        }

        if (ct === K_CONDITIONAL) {
            /**
             * if/then/else: if passes -> evaluated from if + then.
             * if fails -> evaluated from else.
             */
            let slabOffset = kinds[kindsIdx + 1];
            let ifType = slab[slabOffset + 1];
            let thenType = slab[slabOffset + 2];
            let elseType = slab[slabOffset + 3];
            if (_passes(data, ifType, '')) {
                _collectEvaluatedKeys(data, ifType, result);
                _collectEvaluatedKeys(data, thenType, result);
            } else {
                _collectEvaluatedKeys(data, elseType, result);
            }
            return;
        }

        if (ct === K_REFINE) {
            /** Refine wraps an inner type: evaluated keys come from the inner type */
            let slabOffset = kinds[kindsIdx + 1];
            let innerType = slab[slabOffset + 1];
            _collectEvaluatedKeys(data, innerType, result);
            return;
        }

        if (ct === K_RECORD) {
            /**
             * Record types evaluate all own keys since they provide
             * a schema for every possible property.
             */
            if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
                for (let key in data) {
                    if (hasOwnProperty.call(data, key)) {
                        result.add(key);
                    }
                }
            }
            return;
        }

        if (ct === K_UNEVALUATED) {
            /**
             * Nested unevaluated: the inner type's evaluated keys
             * plus the unevalType covers the rest.
             */
            let slabOffset = kinds[kindsIdx + 1];
            let innerType = slab[slabOffset + 1];
            _collectEvaluatedKeys(data, innerType, result);
            /** The unevalType covers everything the inner type didn't */
            if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
                for (let key in data) {
                    if (hasOwnProperty.call(data, key)) {
                        result.add(key);
                    }
                }
            }
            return;
        }

        if (ct === K_DYN_ANCHOR) {
            /**
             * Dynamic anchor wraps an inner type and provides a scope
             * for dynamic references. Push scope, walk inner type, pop scope.
             */
            let slabOffset = kinds[kindsIdx + 1];
            DYN_ANCHORS[DYN_PTR++] = slabOffset;
            _collectEvaluatedKeys(data, slab[slabOffset + 1], result);
            DYN_PTR--;
            return;
        }

        if (ct === K_DYN_REF) {
            /**
             * Dynamic reference: resolve target type through DYN_ANCHORS
             * scope stack, then collect evaluated keys from resolved target.
             */
            let slabOffset = kinds[kindsIdx + 1];
            let anchorKeyId = slab[slabOffset + 1];
            let targetType = slab[slabOffset + 2];
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
            _collectEvaluatedKeys(data, targetType, result);
            return;
        }

        if (ct === K_PRIMITIVE) {
            /** Primitive types don't evaluate object keys */
            return;
        }
    }

    /**
     * Collects the set of array indices that a type structurally evaluates.
     * Used by K_UNEVALUATED (mode=1) to determine which items are covered
     * by the inner type's structural keywords.
     *
     * @param {*} data - the actual data (needed for conditional/branch checks)
     * @param {number} typedef - the type to walk
     * @param {number} dataLength - length of the array being validated
     * @param {!Set<number>} result - accumulator set of evaluated item indices
     */
    function _collectEvaluatedItems(data, typedef, dataLength, result) {
        /**
         * Non-COMPLEX types: check for inline MOD_ARRAY which evaluates
         * all items since it provides a schema for every element.
         */
        if (!(typedef & COMPLEX)) {
            if ((typedef & MODIFIER) && (typedef & MOD_MASK) === MOD_ARRAY) {
                for (let i = 0; i < dataLength; i++) {
                    result.add(i);
                }
            }
            return;
        }
        let kinds = HEAP.KINDS;
        let slab = HEAP.SLAB;
        let kindsIdx = (typedef >>> 3) << 1;
        let header = kinds[kindsIdx];
        let ct = header & KIND_ENUM_MASK;

        /**
         * K_ANY_INNER arrays/objects are bare container type checks
         * that don't evaluate individual items or properties.
         */
        if (header & K_ANY_INNER) {
            return;
        }

        if (ct === K_ARRAY) {
            /**
             * K_ARRAY with K_HAS_ITEMS evaluates all items.
             * Without K_HAS_ITEMS it's a bare array container.
             */
            if (header & K_HAS_ITEMS) {
                for (let i = 0; i < dataLength; i++) {
                    result.add(i);
                }
            }
            /**
             * If the array has a validator with V_CONTAINS, matching items
             * are evaluated. We check each item against the contains type.
             */
            if (header & K_VALIDATOR) {
                let vHeader = kinds[kindsIdx + 2];
                if (vHeader & V_CONTAINS) {
                    let vals = HEAP.VALIDATORS;
                    let valPtr = kinds[kindsIdx + 3];
                    let cp = valPtr + popcnt16(vHeader & (V_CONTAINS - 1));
                    let containsType = vals[cp] >>> 0;
                    for (let i = 0; i < dataLength; i++) {
                        if (_passes(data[i], containsType, '')) {
                            result.add(i);
                        }
                    }
                }
            }
            return;
        }

        if (ct === K_TUPLE) {
            /** Tuple evaluates prefix items, and rest items if K_HAS_REST */
            let slabOffset = kinds[kindsIdx + 1];
            let count = slab[slabOffset];
            let hasRest = (header & K_HAS_REST) !== 0;
            let fixedCount = hasRest ? count - 1 : count;
            let evalCount = dataLength < fixedCount ? dataLength : fixedCount;
            for (let i = 0; i < evalCount; i++) {
                result.add(i);
            }
            if (hasRest) {
                for (let i = fixedCount; i < dataLength; i++) {
                    result.add(i);
                }
            }
            /**
             * If the tuple has a validator with V_CONTAINS, matching items
             * are evaluated.
             */
            if (header & K_VALIDATOR) {
                let vHeader = kinds[kindsIdx + 2];
                if (vHeader & V_CONTAINS) {
                    let vals = HEAP.VALIDATORS;
                    let valPtr = kinds[kindsIdx + 3];
                    let cp = valPtr + popcnt16(vHeader & (V_CONTAINS - 1));
                    let containsType = vals[cp] >>> 0;
                    for (let i = 0; i < dataLength; i++) {
                        if (_passes(data[i], containsType, '')) {
                            result.add(i);
                        }
                    }
                }
            }
            return;
        }

        if (ct === K_INTERSECT) {
            /** allOf: union of evaluated items from all branches */
            let slabOffset = kinds[kindsIdx + 1];
            let count = slab[slabOffset];
            for (let i = 0; i < count; i++) {
                _collectEvaluatedItems(data, slab[slabOffset + 1 + i], dataLength, result);
            }
            return;
        }

        if (ct === K_OR) {
            /** anyOf: union of evaluated items from passing branches */
            let slabOffset = kinds[kindsIdx + 1];
            let count = slab[slabOffset];
            for (let i = 0; i < count; i++) {
                let branchType = slab[slabOffset + 1 + i];
                if (_passes(data, branchType, '')) {
                    _collectEvaluatedItems(data, branchType, dataLength, result);
                }
            }
            return;
        }

        if (ct === K_EXCLUSIVE) {
            /** oneOf: evaluated items from the single passing branch */
            let slabOffset = kinds[kindsIdx + 1];
            let count = slab[slabOffset];
            for (let i = 0; i < count; i++) {
                let branchType = slab[slabOffset + 1 + i];
                if (_passes(data, branchType, '')) {
                    _collectEvaluatedItems(data, branchType, dataLength, result);
                    break;
                }
            }
            return;
        }

        if (ct === K_CONDITIONAL) {
            /** if/then/else: evaluated items depend on which branch passes */
            let slabOffset = kinds[kindsIdx + 1];
            let ifType = slab[slabOffset + 1];
            let thenType = slab[slabOffset + 2];
            let elseType = slab[slabOffset + 3];
            if (_passes(data, ifType, '')) {
                _collectEvaluatedItems(data, ifType, dataLength, result);
                _collectEvaluatedItems(data, thenType, dataLength, result);
            } else {
                _collectEvaluatedItems(data, elseType, dataLength, result);
            }
            return;
        }

        if (ct === K_REFINE) {
            let slabOffset = kinds[kindsIdx + 1];
            let innerType = slab[slabOffset + 1];
            _collectEvaluatedItems(data, innerType, dataLength, result);
            return;
        }

        if (ct === K_UNEVALUATED) {
            /**
             * Nested unevaluated covers inner + unevalType for everything else.
             * Mark all items as evaluated since the wrapper covers them.
             */
            let slabOffset = kinds[kindsIdx + 1];
            let innerType = slab[slabOffset + 1];
            _collectEvaluatedItems(data, innerType, dataLength, result);
            for (let i = 0; i < dataLength; i++) {
                result.add(i);
            }
            return;
        }

        if (ct === K_DYN_ANCHOR) {
            /**
             * Dynamic anchor wraps an inner type and provides a scope
             * for dynamic references. Push scope, walk inner type, pop scope.
             */
            let slabOffset = kinds[kindsIdx + 1];
            DYN_ANCHORS[DYN_PTR++] = slabOffset;
            _collectEvaluatedItems(data, slab[slabOffset + 1], dataLength, result);
            DYN_PTR--;
            return;
        }

        if (ct === K_DYN_REF) {
            /**
             * Dynamic reference: resolve target type through DYN_ANCHORS
             * scope stack, then collect evaluated items from resolved target.
             */
            let slabOffset = kinds[kindsIdx + 1];
            let anchorKeyId = slab[slabOffset + 1];
            let targetType = slab[slabOffset + 2];
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
            _collectEvaluatedItems(data, targetType, dataLength, result);
            return;
        }
    }

    /**
     * Diagnoses K_UNEVALUATED — wraps an inner type with evaluation tracking.
     * This implementation is fully self-contained: it walks the inner type
     * structure via _collectEvaluatedKeys/_collectEvaluatedItems to determine
     * which properties/items are "evaluated", then diagnoses any unevaluated
     * ones against the unevalType schema.
     *
     * @param {*} data
     * @param {number} innerType - the inner type that the unevaluated wrapper contains
     * @param {number} unevalType - the schema that unevaluated properties/items must match
     * @param {number} unevalMode - 0 = property tracking (objects), 1 = item tracking (arrays)
     * @param {string} path
     * @param {!Array<boer.PathError>} errors
     */
    function _diagnoseUnevaluated(data, innerType, unevalType, unevalMode, path, errors) {
        if (unevalMode === 1) {
            /** Items tracking (arrays) */
            if (!Array.isArray(data)) {
                /** Not an array: just diagnose the inner type */
                _diagnose(data, innerType, path, errors);
                return;
            }

            /** First, diagnose the inner type to collect its errors */
            _diagnose(data, innerType, path, errors);

            /**
             * Collect which items are structurally evaluated by the inner type.
             * Any item NOT in this set must match unevalType.
             */
            let evaluated = new Set();
            _collectEvaluatedItems(data, innerType, data.length, evaluated);
            for (let i = 0; i < data.length; i++) {
                if (!evaluated.has(i)) {
                    _diagnose(data[i], unevalType, path + '[' + i + ']', errors);
                }
            }
            return;
        }

        /** Property tracking (objects) */
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
            /** Not an object: just diagnose the inner type */
            _diagnose(data, innerType, path, errors);
            return;
        }

        /** First, diagnose the inner type to collect its errors */
        _diagnose(data, innerType, path, errors);

        /**
         * Collect which keys are structurally evaluated by the inner type.
         * Any key NOT in this set must match unevalType.
         */
        let evaluated = new Set();
        _collectEvaluatedKeys(data, innerType, evaluated);
        for (let key in data) {
            if (!hasOwnProperty.call(data, key)) {
                continue;
            }
            if (!evaluated.has(key)) {
                let fieldPath = path ? path + '.' + key : key;
                _diagnose(data[key], unevalType, fieldPath, errors);
            }
        }
    }

    /**
     * Main diagnose function. Mirrors _validate from catalog.js, collecting
     * all errors into the errors array instead of returning false.
     * Fully self-contained — never calls _validate.
     *
     * @param {*} data
     * @param {number} typedef
     * @param {string} path
     * @param {!Array<boer.PathError>} errors
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
                             * Use _passes instead of _validate to check.
                             */
                            if (!(type & NULLABLE) && !_passes(val, type, fieldPath)) {
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
     * Mirrors _validateRareKind from catalog.js. Fully self-contained:
     * uses _diagnose + _passes instead of _validate throughout.
     *
     * @param {*} data
     * @param {number} ct - kind enum
     * @param {!Uint32Array} kinds - KINDS vtable
     * @param {number} kindsIdx - raw KINDS array index
     * @param {number} header - KINDS[kindsIdx] header word
     * @param {string} path
     * @param {!Array<boer.PathError>} errors
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
                /**
                 * allOf: diagnose each branch directly into the main errors array.
                 * This naturally collects all errors from all failing branches.
                 */
                let slabOffset = kinds[kindsIdx + 1];
                let count = slab[slabOffset];
                for (let i = 0; i < count; i++) {
                    _diagnose(data, slab[slabOffset + 1 + i], path, errors);
                }
                return;
            }
            case K_OR: {
                /**
                 * anyOf: test each branch with temp errors. If any branch
                 * produces 0 errors, the data passes. If none pass, push
                 * a single "did not match any" error.
                 */
                let slabOffset = kinds[kindsIdx + 1];
                let count = slab[slabOffset];
                for (let i = 0; i < count; i++) {
                    /** @type {!Array<boer.PathError>} */
                    let tempErrors = [];
                    _diagnose(data, slab[slabOffset + 1 + i], path, tempErrors);
                    if (tempErrors.length === 0) {
                        /** Branch matched: anyOf passes */
                        return;
                    }
                }
                errors.push({ path, message: 'value did not match any of ' + count + ' alternatives (anyOf)' });
                return;
            }
            case K_EXCLUSIVE: {
                /**
                 * oneOf: test each branch with temp errors. Count how many
                 * produce 0 errors. Exactly 1 must pass.
                 */
                let slabOffset = kinds[kindsIdx + 1];
                let count = slab[slabOffset];
                let matchCount = 0;
                for (let i = 0; i < count; i++) {
                    /** @type {!Array<boer.PathError>} */
                    let tempErrors = [];
                    _diagnose(data, slab[slabOffset + 1 + i], path, tempErrors);
                    if (tempErrors.length === 0) {
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
                /**
                 * Diagnose inner type first. If inner passes (0 errors from
                 * temp check), test callback and report if it fails.
                 */
                let slabOffset = kinds[kindsIdx + 1];
                let innerType = slab[slabOffset + 1];
                let callbackIdx = slab[slabOffset + 2];
                /** Collect inner type errors into the main errors array */
                _diagnose(data, innerType, path, errors);
                /**
                 * Check if inner type passes (using temp errors) to decide
                 * whether to run the callback. Only test the callback if
                 * the data actually matches the inner type.
                 */
                if (_passes(data, innerType, path)) {
                    if (!CALLBACKS[callbackIdx](data)) {
                        errors.push({ path, message: 'refinement check failed' });
                    }
                }
                return;
            }
            case K_NOT: {
                /**
                 * not: call _diagnose with temp errors. If temp is empty
                 * (value matched the inner type), push "should NOT match".
                 * If temp has errors (value didn't match), that's correct.
                 */
                /** @type {!Array<boer.PathError>} */
                let tempErrors = [];
                _diagnose(data, kinds[kindsIdx + 1], path, tempErrors);
                if (tempErrors.length === 0) {
                    errors.push({ path, message: 'value should NOT match the given type' });
                }
                return;
            }
            case K_CONDITIONAL: {
                /**
                 * if/then/else: test if-branch with temp errors.
                 * If empty (if passed), diagnose then-branch.
                 * If temp has errors (if failed), diagnose else-branch.
                 */
                let slabOffset = kinds[kindsIdx + 1];
                let ifType = slab[slabOffset + 1];
                let thenType = slab[slabOffset + 2];
                let elseType = slab[slabOffset + 3];
                /** @type {!Array<boer.PathError>} */
                let tempErrors = [];
                _diagnose(data, ifType, path, tempErrors);
                if (tempErrors.length === 0) {
                    /** if-branch passed: diagnose then-branch */
                    _diagnose(data, thenType, path, errors);
                } else {
                    /** if-branch failed: diagnose else-branch */
                    _diagnose(data, elseType, path, errors);
                }
                return;
            }
            case K_DYN_ANCHOR: {
                /** Push scope onto DYN_ANCHORS stack, diagnose inner type */
                let slabOffset = kinds[kindsIdx + 1];
                DYN_ANCHORS[DYN_PTR++] = slabOffset;
                _diagnose(data, slab[slabOffset + 1], path, errors);
                DYN_PTR--;
                return;
            }
            case K_DYN_REF: {
                /**
                 * Resolve the target type by searching the DYN_ANCHORS scope
                 * stack, then diagnose the resolved type directly.
                 */
                let slabOffset = kinds[kindsIdx + 1];
                let anchorKeyId = slab[slabOffset + 1];
                let targetType = slab[slabOffset + 2];
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
                 * K_UNEVALUATED: delegates to _diagnoseUnevaluated which walks the
                 * inner type structure to determine evaluated keys/items, then
                 * diagnoses any unevaluated ones against unevalType.
                 */
                let slabOffset = kinds[kindsIdx + 1];
                let innerType = slab[slabOffset + 1];
                let unevalType = slab[slabOffset + 2];
                let unevalMode = slab[slabOffset + 3];
                _diagnoseUnevaluated(data, innerType, unevalType, unevalMode, path, errors);
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
     * @returns {!Array<boer.PathError>}
     */
    function diagnose(data, typedef) {
        /** @type {!Array<boer.PathError>} */
        let errors = [];
        DYN_PTR = 0;
        _diagnose(data, typedef, '', errors);
        return errors;
    }

    return diagnose;
}

export { createDiagnose };
