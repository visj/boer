// --- BIT LAYOUT ---
// Bit 31:  COMPLEX   (0 = primitive typedef, 1 = complex typedef)
// Bit 30:  SCRATCH   (typedef lives in scratch storage)
// Bit 29:  NULLABLE  (typedef accepts null)
// Bit 28:  OPTIONAL  (typedef accepts undefined)
// Bits 0-27:
//   If COMPLEX=0: primitive type flags (layered bit mask)
//   If COMPLEX=1: index into KIND table

const COMPLEX = (1 << 31) >>> 0;
const SCRATCH = 1 << 30;
const NULLABLE = 1 << 29;
const OPTIONAL = 1 << 28;

/**
 * Primitive type bits (bits 15-27)
 *
 * Layer 1: Meta types
 *   27: ANY    - matches everything (JSON Schema true/{})
 *   26: NEVER  - matches nothing (JSON Schema false)
 *   25: REST   - marks a tuple rest element on the SLAB
 *
 * Layer 2: JS value types
 *   24: FALSE    23: TRUE     (BOOLEAN = FALSE | TRUE)
 *   22: NUMBER   21: STRING   20: INTEGER   19: BIGINT
 *   18: (reserved)  17: (reserved)  16: DATE  15: URI
 *
 * ARRAY and OBJECT are complex-only types (K_ARRAY, K_OBJECT).
 * They are no longer primitive value bits.
 *
 * Bits 9-14: Reserved for future use
 * Bit 8: CONTEXT (payload flag for sub-type enum in bits 0-7)
 * Bits 0-7: Payload data (when CONTEXT=1)
 */
const ANY = 1 << 27;
const NEVER = 1 << 26;
const REST = 1 << 25 >>> 0;
const FALSE = 1 << 24;
const TRUE = 1 << 23;
const BOOLEAN = FALSE | TRUE;
const NUMBER = 1 << 22;
const STRING = 1 << 21;
const INTEGER = 1 << 20;
const BIGINT = 1 << 19;
const DATE = 1 << 16;
const URI = 1 << 15;
const CONTEXT = 1 << 8;

/**
 * SIMPLE: all non-header, non-container type bits (used for K_PRIMITIVE headers)
 * VALUE: true value types only (no containers, no meta types)
 */
const SIMPLE = (ANY | NEVER | REST | FALSE | TRUE | NUMBER | STRING | INTEGER | BIGINT | DATE | URI);
const VALUE = (FALSE | TRUE | NUMBER | STRING | INTEGER | BIGINT | DATE | URI);
const PRIM_MASK = 0x0FFFFFFF;
const KIND_MASK = 0x0FFFFFFF;

/**
 * The KINDS type matches the bit layout of the `typedef`.
 * The 2 uppermost bits contain global metadata. Since
 * null and undefined actually belong in the primitive space,
 * we cannot use any more bits, because then the null/undefined
 * would be overridden in the fast K_PRIMITIVE case where we inline 
 * primitive bits into the kinds header
 * Bit 31:  K_VALIDATOR   
 * Bit 30:  K_ANY_INNER
 */

/**
 * When this bit is toggled, we have stored a pointer to the VALIDATORS
 * registry in the KINDS vtable.
 */
const K_VALIDATOR = (1 << 31) >>> 0;
/**
 * K_ANY_INNER: when set on a KINDS header, the inner type is ANY
 * and no registry entry exists. The KINDS slot is only 1 wide.
 * Used for bare `type: "array"`, `type: "object"`, `record(ANY)`, etc.
 */
const K_ANY_INNER = 1 << 30;

// ── Complex KINDS enum (bits 0-3, values 0-11) ──
// The KINDS vtable header stores the enum in the lower 4 bits,
// followed by HAS_VALIDATOR at bit 4 and K_ANY_INNER at bit 8.
// Every kind has a unique value — no sub-groups or inner-type bit flags.
const K_PRIMITIVE   = 0;
const K_OBJECT      = 1;
const K_ARRAY       = 2;
const K_RECORD      = 3;
const K_OR          = 4;
const K_EXCLUSIVE   = 5;
const K_INTERSECT   = 6;
const K_UNION       = 7;
const K_TUPLE       = 8;
const K_REFINE      = 9;
const K_NOT         = 10;
const K_CONDITIONAL = 11;
const K_DYN_ANCHOR = 12;
const K_DYN_REF = 13;

const KIND_ENUM_MASK = 0xF;

// --- Validator bit flags (globally unique, unified layout) ---
//
// Payload flags (bits 0–13): each set bit pushes exactly 1 Float64 to the payload slab.
// Boolean flags (bits 16–31): no payload, just toggle behavior.
//
// Offset of any payload flag's value = popcnt16(vHeader & (FLAG - 1))
//

// String payload flags
const V_MIN_LENGTH = 1;
const V_MAX_LENGTH = 1 << 1;
const V_PATTERN = 1 << 2;
const V_FORMAT = 1 << 3;
// Number payload flags
const V_MINIMUM = 1 << 4;
const V_MAXIMUM = 1 << 5;
const V_MULTIPLE_OF = 1 << 6;
// Array payload flags
const V_MIN_ITEMS = 1 << 7;
const V_MAX_ITEMS = 1 << 8;
const V_CONTAINS = 1 << 9;
const V_MIN_CONTAINS = 1 << 10;
const V_MAX_CONTAINS = 1 << 11;
// Object payload flags
const V_MIN_PROPERTIES = 1 << 12;
const V_MAX_PROPERTIES = 1 << 13;
// Object variable-length payload flags (sequential p++ only, NOT popcount-compatible).
// These are only used by K_OBJECT (catalog API), never by K_PRIMITIVE (JSON Schema).
const V_DEPENDENT_REQUIRED = 1 << 16;
const V_PATTERN_PROPERTIES = 1 << 17;
const V_PROPERTY_NAMES = 1 << 18;
const V_DEPENDENT_SCHEMAS = 1 << 19;
const V_UNEVALUATED_ITEMS = 1 << 20;
const V_UNEVALUATED_PROPERTIES = 1 << 21;
/**
 * V_ENUM: variable-length enum membership payload for K_PRIMITIVE validators.
 * Bit 22 — sequential, never co-occurs with bits 16–21 (those are K_OBJECT only).
 * Payload layout (after fixed-slot payloads at base + popcnt16(vHeader & 0xFFFF)):
 *   If primBits & STRING: [ strCount, sortedKeyId0, ..., sortedKeyIdN ]
 *   If primBits & (NUMBER|INTEGER): [ numCount, sortedNum0, ..., sortedNumM ]
 *   If both: string segment first, then number segment.
 */
const V_ENUM = 1 << 22;

// Boolean modifier flags (no payload)
const V_EXCLUSIVE_MINIMUM = 1 << 28;
const V_EXCLUSIVE_MAXIMUM = 1 << 29;
const V_UNIQUE_ITEMS = 1 << 30;
const V_ADDITIONAL_PROPERTIES = (1 << 31) >>> 0;

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

// Format enum values (string format validator)
const FMT_EMAIL = 1;
const FMT_IPV4 = 2;
const FMT_UUID = 3;
const FMT_DATETIME = 4;

// Format validation regexes
const FMT_RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FMT_RE_IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const FMT_RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FMT_RE_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

/** @type {Record<string, number>} */
const FMT_MAP = { email: FMT_EMAIL, ipv4: FMT_IPV4, uuid: FMT_UUID, 'date-time': FMT_DATETIME };

/** @const @type {symbol} */
const FAIL = Symbol('FAIL');

/**
 * Returns the number of Unicode code points in a string.
 * JSON Schema counts code points, not UTF-16 code units.
 * @param {string} str
 * @returns {number}
 */
function codepointLen(str) {
    let len = 0;
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) {
            i++;
        }
        len++;
    }
    return len;
}

const toString = Object.prototype.toString;
const hasOwnProperty = Object.prototype.hasOwnProperty;

export {
    COMPLEX, NULLABLE, OPTIONAL, SCRATCH,
    ANY, NEVER, REST, FALSE, TRUE, BOOLEAN,
    NUMBER, STRING, INTEGER, BIGINT,
    DATE, URI,
    CONTEXT, SIMPLE, VALUE, PRIM_MASK, KIND_MASK,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_RECORD,
    K_OR, K_EXCLUSIVE, K_INTERSECT,
    K_UNION, K_TUPLE, K_REFINE, K_NOT,
    K_CONDITIONAL, K_DYN_ANCHOR, K_DYN_REF, K_ANY_INNER,
    KIND_ENUM_MASK, K_VALIDATOR,
    V_MIN_LENGTH, V_MAX_LENGTH, V_PATTERN, V_FORMAT,
    V_MINIMUM, V_MAXIMUM, V_MULTIPLE_OF, V_EXCLUSIVE_MINIMUM, V_EXCLUSIVE_MAXIMUM,
    V_MIN_ITEMS, V_MAX_ITEMS, V_CONTAINS, V_MIN_CONTAINS, V_MAX_CONTAINS,
    V_UNIQUE_ITEMS, V_MIN_PROPERTIES, V_MAX_PROPERTIES, V_PATTERN_PROPERTIES, V_PROPERTY_NAMES,
    V_ADDITIONAL_PROPERTIES, V_DEPENDENT_REQUIRED,
    V_UNEVALUATED_ITEMS, V_UNEVALUATED_PROPERTIES, V_DEPENDENT_SCHEMAS,
    V_ENUM,
    popcnt16,
    FMT_EMAIL, FMT_IPV4, FMT_UUID, FMT_DATETIME, FMT_MAP,
    FMT_RE_EMAIL, FMT_RE_IPV4, FMT_RE_UUID, FMT_RE_DATETIME,
    FAIL, codepointLen, toString, hasOwnProperty
}

// Backward-compatible aliases
export { NULLABLE as NULL, OPTIONAL as UNDEFINED };