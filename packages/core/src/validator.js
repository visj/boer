import {
    V_MIN_LENGTH, V_MAX_LENGTH, V_PATTERN, V_FORMAT,
    V_MINIMUM, V_MAXIMUM, V_MULTIPLE_OF, V_EXCLUSIVE_MINIMUM, V_EXCLUSIVE_MAXIMUM,
    V_MIN_ITEMS, V_MAX_ITEMS, V_CONTAINS, V_MIN_CONTAINS, V_MAX_CONTAINS,
    V_UNIQUE_ITEMS,
    V_MIN_PROPERTIES, V_MAX_PROPERTIES, V_UNEVALUATED_ITEMS, V_UNEVALUATED_PROPERTIES,
    V_DEPENDENT_REQUIRED, V_PATTERN_PROPERTIES, V_PROPERTY_NAMES,
    V_ADDITIONAL_PROPERTIES,
    FMT_MAP,
} from './const.js';

/**
 * @typedef {import("json-schema-typed").JSONSchema} JSONSchema
 */

/**
 * @typedef {Extract<JSONSchema, object>} Schema
 */

/**
 * Out-of-band storage for RegExp objects that cannot be placed into the
 * numeric payload array. packValidators pushes to this queue and writes a
 * -1 placeholder in its output array. The caller migrates the RegExps into
 * whichever cache is appropriate (catalog REGEX_CACHE or ast.regexes[]) and
 * replaces the -1 placeholders with the real indices.
 *
 * Reset at the start of every packValidators call.
 */
export const PAYLOAD_QUEUE = {
    /** @type {!Array<RegExp|null>} */
    REGEX: new Array(12),
    REGEX_LEN: 0,
};

/**
 * Extracts pure constraints from a schema or DSL options object and packs them
 * into a contiguous tuple `[vHeader, payload0, payload1, ...]`.
 *
 * Payloads for bits 0–15 are in ascending bit order so that
 * `popcnt16(vHeader & (FLAG - 1))` gives the index of any flag's value.
 * Payloads for bits 16–19 are appended sequentially after the fixed-slot
 * payloads and must be read with a running pointer, not popcnt.
 *
 * Regex payloads (V_PATTERN, V_PATTERN_PROPERTIES) cannot fit in the numeric
 * array: -1 is written as a placeholder and the actual RegExp is pushed onto
 * PAYLOAD_QUEUE.REGEX. The caller replaces each -1 by consuming the queue in
 * order.
 *
 * @param {!Schema} opts — schema or DSL options object
 * @param {number} mask  — bitmask of V_* flags to consider
 * @param {((key: string) => number)|null} lookup — maps string keys to IDs;
 *   required for V_DEPENDENT_REQUIRED and V_PATTERN_PROPERTIES type ids are
 *   already numbers in opts, so lookup is only for key strings
 * @returns {!Array<number>} [vHeader, ...payloads]
 */
export function packValidators(opts, mask, lookup) {
    if (PAYLOAD_QUEUE.REGEX_LEN > 0) {
        for (let i = 0; i < PAYLOAD_QUEUE.REGEX_LEN; i++) {
            PAYLOAD_QUEUE.REGEX[i] = null;
        }
        PAYLOAD_QUEUE.REGEX_LEN = 0;
    }

    let vHeader = 0;
    /** @type {!Array<number>} */
    let out = [0]; // out[0] is the vHeader placeholder

    // ── Fixed-slot payloads (bits 0–15, popcnt16-indexed) ──
    // Each flag that is set pushes exactly one value; they must be pushed in
    // ascending bit order so the popcnt offset formula stays valid.

    if ((mask & V_MIN_LENGTH) && opts.minLength !== void 0) {
        vHeader |= V_MIN_LENGTH;
        out.push(+opts.minLength);
    }
    if ((mask & V_MAX_LENGTH) && opts.maxLength !== void 0) {
        vHeader |= V_MAX_LENGTH;
        out.push(+opts.maxLength);
    }
    if ((mask & V_PATTERN) && opts.pattern !== void 0) {
        vHeader |= V_PATTERN;
        PAYLOAD_QUEUE.REGEX[PAYLOAD_QUEUE.REGEX_LEN++] = typeof opts.pattern === 'string' ? new RegExp(opts.pattern, 'u') : opts.pattern;
        out.push(-1);
    }
    if ((mask & V_FORMAT) && opts.format !== void 0) {
        let fmt = FMT_MAP[opts.format];
        if (fmt === void 0) {
            throw new Error('Unknown string format: ' + opts.format);
        }
        vHeader |= V_FORMAT;
        out.push(fmt);
    }

    // V_MINIMUM (bit 4) and V_EXCLUSIVE_MINIMUM (bit 28, boolean modifier).
    // When both are present, the stricter bound wins — the bound value is stored
    // and V_EXCLUSIVE_MINIMUM acts as a modifier flag with no separate payload.
    {
        let min = opts.minimum;
        let exMin = opts.exclusiveMinimum;
        if (min !== void 0 && exMin !== void 0) {
            if ((mask & V_MINIMUM) || (mask & V_EXCLUSIVE_MINIMUM)) {
                if (+exMin >= +min) {
                    vHeader |= V_MINIMUM | V_EXCLUSIVE_MINIMUM;
                    out.push(+exMin);
                } else {
                    vHeader |= V_MINIMUM;
                    out.push(+min);
                }
            }
        } else if (min !== void 0 && (mask & V_MINIMUM)) {
            vHeader |= V_MINIMUM;
            out.push(+min);
        } else if (exMin !== void 0 && ((mask & V_MINIMUM) || (mask & V_EXCLUSIVE_MINIMUM))) {
            vHeader |= V_MINIMUM | V_EXCLUSIVE_MINIMUM;
            out.push(+exMin);
        }
    }

    // V_MAXIMUM (bit 5) and V_EXCLUSIVE_MAXIMUM (bit 29, boolean modifier).
    {
        let max = opts.maximum;
        let exMax = opts.exclusiveMaximum;
        if (max !== void 0 && exMax !== void 0) {
            if ((mask & V_MAXIMUM) || (mask & V_EXCLUSIVE_MAXIMUM)) {
                if (+exMax <= +max) {
                    vHeader |= V_MAXIMUM | V_EXCLUSIVE_MAXIMUM;
                    out.push(+exMax);
                } else {
                    vHeader |= V_MAXIMUM;
                    out.push(+max);
                }
            }
        } else if (max !== void 0 && (mask & V_MAXIMUM)) {
            vHeader |= V_MAXIMUM;
            out.push(+max);
        } else if (exMax !== void 0 && ((mask & V_MAXIMUM) || (mask & V_EXCLUSIVE_MAXIMUM))) {
            vHeader |= V_MAXIMUM | V_EXCLUSIVE_MAXIMUM;
            out.push(+exMax);
        }
    }

    if ((mask & V_MULTIPLE_OF) && opts.multipleOf !== void 0) {
        vHeader |= V_MULTIPLE_OF;
        out.push(+opts.multipleOf);
    }
    if ((mask & V_MIN_ITEMS) && opts.minItems !== void 0) {
        vHeader |= V_MIN_ITEMS;
        out.push(+opts.minItems);
    }
    if ((mask & V_MAX_ITEMS) && opts.maxItems !== void 0) {
        vHeader |= V_MAX_ITEMS;
        out.push(+opts.maxItems);
    }
    if ((mask & V_CONTAINS) && opts.contains !== void 0) {
        vHeader |= V_CONTAINS;
        out.push(/** @type {number} */(opts.contains) >>> 0);
    }
    if ((mask & V_MIN_CONTAINS) && opts.minContains !== void 0) {
        vHeader |= V_MIN_CONTAINS;
        out.push(Math.floor(+opts.minContains));
    }
    if ((mask & V_MAX_CONTAINS) && opts.maxContains !== void 0) {
        vHeader |= V_MAX_CONTAINS;
        out.push(Math.floor(+opts.maxContains));
    }
    if ((mask & V_MIN_PROPERTIES) && opts.minProperties !== void 0) {
        vHeader |= V_MIN_PROPERTIES;
        out.push(Math.floor(+opts.minProperties));
    }
    if ((mask & V_MAX_PROPERTIES) && opts.maxProperties !== void 0) {
        vHeader |= V_MAX_PROPERTIES;
        out.push(Math.floor(+opts.maxProperties));
    }
    if ((mask & V_UNEVALUATED_ITEMS) && opts.unevaluatedItems !== void 0) {
        vHeader |= V_UNEVALUATED_ITEMS;
        out.push(/** @type {number} */(opts.unevaluatedItems) >>> 0);
    }
    if ((mask & V_UNEVALUATED_PROPERTIES) && opts.unevaluatedProperties !== void 0) {
        vHeader |= V_UNEVALUATED_PROPERTIES;
        out.push(/** @type {number} */(opts.unevaluatedProperties) >>> 0);
    }

    // ── Boolean modifier flags (no payload slot) ──

    if ((mask & V_UNIQUE_ITEMS) && opts.uniqueItems === true) {
        vHeader |= V_UNIQUE_ITEMS;
    }

    // ── Sequential high-bit payloads (bits 16–19, variable-length) ──
    // These are appended after all fixed-slot payloads and must be read with a
    // running pointer `p = off + popcnt16(vHeader & 0xFFFF)`, not by popcnt.

    if ((mask & V_DEPENDENT_REQUIRED) && opts.dependentRequired !== void 0 && lookup !== null) {
        vHeader |= V_DEPENDENT_REQUIRED;
        let triggers = Object.keys(opts.dependentRequired);
        out.push(triggers.length);
        for (let i = 0; i < triggers.length; i++) {
            let triggerKey = triggers[i];
            let deps = opts.dependentRequired[triggerKey];
            out.push(lookup(triggerKey));
            out.push(deps.length);
            for (let j = 0; j < deps.length; j++) {
                out.push(lookup(deps[j]));
            }
        }
    }

    if ((mask & V_PATTERN_PROPERTIES) && opts.patternProperties !== void 0) {
        vHeader |= V_PATTERN_PROPERTIES;
        let pKeys = Object.keys(opts.patternProperties);
        out.push(pKeys.length);
        for (let i = 0; i < pKeys.length; i++) {
            let pat = pKeys[i];
            PAYLOAD_QUEUE.REGEX[PAYLOAD_QUEUE.REGEX_LEN++] = new RegExp(pat, 'u');
            out.push(-1); // placeholder for regex cache index
            out.push(/** @type {number} */(opts.patternProperties[pat]) >>> 0); // compiled type id
        }
    }

    if ((mask & V_PROPERTY_NAMES) && opts.propertyNames !== void 0) {
        vHeader |= V_PROPERTY_NAMES;
        out.push(/** @type {number} */(opts.propertyNames) >>> 0);
    }

    if ((mask & V_ADDITIONAL_PROPERTIES) && opts.additionalProperties !== void 0
        && opts.additionalProperties !== true) {
        vHeader |= V_ADDITIONAL_PROPERTIES;
        if (opts.additionalProperties === false) {
            out.push(0);
        } else {
            out.push(/** @type {number} */(opts.additionalProperties) >>> 0);
        }
    }

    out[0] = vHeader;
    return out;
}
