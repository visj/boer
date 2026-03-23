// --- BIT LAYOUT ---
// Bit 31:  COMPLEX   (0 = primitive typedef, 1 = complex typedef)
// Bit 30:  NULLABLE  (typedef accepts null)
// Bit 29:  OPTIONAL  (typedef accepts undefined)
// Bit 28:  SCRATCH   (typedef lives in scratch storage)
// Bits 0-27:
//   If COMPLEX=0: primitive type flags (layered bit mask)
//   If COMPLEX=1: index into KIND table

const COMPLEX = (1 << 31) >>> 0;
const NULLABLE = (1 << 30) >>> 0;
const OPTIONAL = (1 << 29) >>> 0;
const SCRATCH = (1 << 28) >>> 0;

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
 * ARRAY and OBJECT are complex-only types (K_COLLECTION, K_OBJECT).
 * They are no longer primitive value bits.
 *
 * Bits 9-14: Reserved for future use
 * Bit 8: CONTEXT (payload flag for sub-type enum in bits 0-7)
 * Bits 0-7: Payload data (when CONTEXT=1)
 */
const ANY = (1 << 27) >>> 0;
const NEVER = (1 << 26) >>> 0;
const REST = (1 << 25) >>> 0;
const FALSE = (1 << 24) >>> 0;
const TRUE = (1 << 23) >>> 0;
const BOOLEAN = (FALSE | TRUE) >>> 0;
const NUMBER = (1 << 22) >>> 0;
const STRING = (1 << 21) >>> 0;
const INTEGER = (1 << 20) >>> 0;
const BIGINT = (1 << 19) >>> 0;
const DATE = (1 << 16) >>> 0;
const URI = (1 << 15) >>> 0;
const CONTEXT = (1 << 8) >>> 0;

/**
 * SIMPLE: all non-header, non-container type bits (used for K_PRIMITIVE headers)
 * VALUE: true value types only (no containers, no meta types)
 */
const SIMPLE = (ANY | NEVER | REST | FALSE | TRUE | NUMBER | STRING | INTEGER | BIGINT | DATE | URI);
const VALUE = (FALSE | TRUE | NUMBER | STRING | INTEGER | BIGINT | DATE | URI);
const PRIM_MASK = 0x0FFFFFFF;
const KIND_MASK = 0x0FFFFFFF;

// ── Complex KINDS enum (bits 0-3, values 0-7) ──
// The KINDS vtable header stores the enum in the lower 4 bits,
// followed by HAS_VALIDATOR, then contextual inner-type bit flags.
const K_PRIMITIVE   = 0;
const K_OBJECT      = 1;
const K_COLLECTION  = 2;   // K_ARRAY, K_RECORD
const K_COMPOSITION = 3;   // K_OR, K_EXCLUSIVE, K_INTERSECT
const K_UNION       = 4;
const K_TUPLE       = 5;
const K_WRAPPER     = 6;   // K_REFINE, K_NOT
const K_CONDITIONAL = 7;

const KIND_ENUM_MASK = 0xF;
const HAS_VALIDATOR = 1 << 4;

// ── Inner type bit flags (bits 5+, contextual per group) ──
// K_COLLECTION inner flags
const K_ARRAY  = 1 << 5;
const K_RECORD = 1 << 6;
// K_COMPOSITION inner flags
const K_OR        = 1 << 5;
const K_EXCLUSIVE = 1 << 6;
const K_INTERSECT = 1 << 7;
// K_WRAPPER inner flags
const K_REFINE = 1 << 5;
const K_NOT    = 1 << 6;

/**
 * K_ANY_INNER: when set on a KINDS header, the inner type is ANY
 * and no registry entry exists. The KINDS slot is only 1 wide.
 * Used for bare `type: "array"`, `type: "object"`, `record(ANY)`, etc.
 */
const K_ANY_INNER = 1 << 8;

// --- Validator bit flags (globally unique, unified layout) ---
//
// Payload flags (bits 0–13): each set bit pushes exactly 1 Float64 to the payload slab.
// Boolean flags (bits 16–31): no payload, just toggle behavior.
//
// Offset of any payload flag's value = popcnt16(vHeader & (FLAG - 1))
//

// String payload flags
const V_STR_MIN_LEN = 1;
const V_STR_MAX_LEN = 1 << 1;
const V_STR_PATTERN = 1 << 2;
const V_STR_FORMAT = 1 << 3;
// Number payload flags
const V_NUM_MIN = 1 << 4;
const V_NUM_MAX = 1 << 5;
const V_NUM_MULTIPLE = 1 << 6;
// Array payload flags
const V_ARR_MIN = 1 << 7;
const V_ARR_MAX = 1 << 8;
const V_ARR_CONTAINS = 1 << 9;
const V_ARR_MIN_CT = 1 << 10;
const V_ARR_MAX_CT = 1 << 11;
// Object payload flags
const V_OBJ_MIN = 1 << 12;
const V_OBJ_MAX = 1 << 13;
// Object variable-length payload flags (sequential p++ only, NOT popcount-compatible).
// These are only used by K_OBJECT (catalog API), never by K_PRIMITIVE (JSON Schema).
// Payloads must be written and read in ascending bit order after the single-payload flags.
const V_OBJ_PAT_PROP = 1 << 14;
const V_OBJ_PROP_NAM = 1 << 15;

// Boolean modifier flags (no payload)
const V_NUM_EX_MIN = 1 << 16;
const V_NUM_EX_MAX = 1 << 17;
const V_ARR_UNIQUE = 1 << 18;
const V_OBJ_NO_ADD = 1 << 19;
const V_OBJ_DEP_REQ = 1 << 20;
// Bits 21–31 reserved

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

const FMT_MAP = { email: FMT_EMAIL, ipv4: FMT_IPV4, uuid: FMT_UUID, 'date-time': FMT_DATETIME };


const U8 = 1;
const U16 = 2;
const U32 = 3;

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
    K_PRIMITIVE, K_OBJECT, K_COLLECTION, K_COMPOSITION,
    K_UNION, K_TUPLE, K_WRAPPER, K_CONDITIONAL,
    K_ARRAY, K_RECORD, K_OR, K_EXCLUSIVE, K_INTERSECT,
    K_REFINE, K_NOT, K_ANY_INNER,
    KIND_ENUM_MASK, HAS_VALIDATOR,
    V_STR_MIN_LEN, V_STR_MAX_LEN, V_STR_PATTERN, V_STR_FORMAT,
    V_NUM_MIN, V_NUM_MAX, V_NUM_MULTIPLE, V_NUM_EX_MIN, V_NUM_EX_MAX,
    V_ARR_MIN, V_ARR_MAX, V_ARR_CONTAINS, V_ARR_MIN_CT, V_ARR_MAX_CT,
    V_ARR_UNIQUE, V_OBJ_MIN, V_OBJ_MAX, V_OBJ_PAT_PROP, V_OBJ_PROP_NAM,
    V_OBJ_NO_ADD, V_OBJ_DEP_REQ,
    popcnt16,
    FMT_EMAIL, FMT_IPV4, FMT_UUID, FMT_DATETIME, FMT_MAP,
    FMT_RE_EMAIL, FMT_RE_IPV4, FMT_RE_UUID, FMT_RE_DATETIME,
    U8, U16, U32, FAIL, codepointLen, toString, hasOwnProperty
}

// Backward-compatible aliases
export { NULLABLE as NULL, OPTIONAL as UNDEFINED };