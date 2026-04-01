/** NEVER is implicitly 0 — a typedef of 0 has no type bits and matches nothing. */
const NEVER = 0;
// --- BIT LAYOUT ---
// Bit 0:   COMPLEX   (0 = primitive typedef, 1 = complex typedef)
// Bit 1:   NULLABLE  (typedef accepts null)
// Bit 2:   OPTIONAL  (typedef accepts undefined)
// Bits 3-7 (primitive, COMPLEX=0): primitive type flags
//   3: ANY     4: STRING     5: NUMBER     6: INTEGER    7: BOOLEAN
// Bits 3+ (complex, COMPLEX=1): raw KINDS array index
//   Store: (1 | (ptr << 3)) >>> 0
//   Extract: typedef >>> 3

const COMPLEX = 1;
const NULLABLE = 2;
const OPTIONAL = 4;

/**
 * Primitive type bits (bits 3-7, only valid when COMPLEX=0)
 *
 *   3: ANY     - matches everything (JSON Schema true/{})
 *   4: STRING  - JS string
 *   5: NUMBER  - JS number
 *   6: INTEGER - JS integer (subset of NUMBER)
 *   7: BOOLEAN - JS boolean (true or false)
 *
 * NEVER is implicitly 0: a typedef of 0 has no type bits set and matches nothing.
 * REST marks a tuple rest element in the SLAB; stored at bit 31 (above typedef range).
 * ARRAY and OBJECT are complex-only types (K_ARRAY, K_OBJECT).
 *
 * Bits 8+: inline modifier encoding (MOD_ENUM for const/enum fast-path).
 */
const ANY = 8;
const STRING = 16;
const NUMBER = 32;
const INTEGER = 64;
const BOOLEAN = 128;

/**
 * SIMPLE: all primitive type bits (used for K_PRIMITIVE headers to mask type info)
 * VALUE: value types only (no ANY meta type)
 * PRIM_MASK: all bits 0-7 (covers COMPLEX + NULLABLE + OPTIONAL + primitive bits)
 */
const SIMPLE = (ANY | STRING | NUMBER | INTEGER | BOOLEAN);
const VALUE = (STRING | NUMBER | INTEGER | BOOLEAN);
const PRIM_MASK = 0xFF;

/**
 * Inline modifier bits (bits 8-10, only valid when COMPLEX=0 and typedef > 0xFF).
 * MODIFIER (bit 8) toggles whether bits 9+ encode a modifier type.
 * When MODIFIER=1, the primitive bits (3-7) describe the *inner* type of the match,
 * and bits 9-10 select which modifier:
 *   MOD_ENUM (2): exact-match against CONSTANTS or ENUMS arena
 *
 * Bit 11: isSet flag (0 = CONSTANTS index, 1 = ENUMS index)
 * Bits 12-29: arena index (18 bits, max 262143 — stays within V8 Smi range)
 *
 * MOD_MASK extracts the 2-bit modifier type from bits 9-10.
 */
const MODIFIER = 1 << 8;
const MOD_ARRAY = 0 << 9;
const MOD_RECORD = 1 << 9;
const MOD_ENUM = 2 << 9;
const MOD_MASK = 3 << 9;

/**
 * Shift to encode/decode the KINDS array index in a complex typedef pointer.
 * Store: (COMPLEX | (ptr << KINDS_SHIFT)) >>> 0. Extract: typedef >>> KINDS_SHIFT.
 */
const KINDS_SHIFT = 3;

/**
 * Bits 0-13 of a validator header contain the payload-bearing flags.
 * Each set bit pushes exactly 1 Float64 to the payload slab.
 * Bits 14-15 are zero-payload modifier flags (V_EXCLUSIVE_MINIMUM/MAXIMUM).
 * Used with popcnt16 to compute payload slot offsets.
 */
const V_PAYLOAD_MASK = 0x3FFF;

// ── MOD_ENUM inline payload bits ──
/** Bit 11: 0 = CONSTANTS arena (const match), 1 = ENUMS arena (Set.has). */
const MOD_ENUM_IS_SET    = 1 << 11;
/** Bits 12-29: 18-bit index into CONSTANTS or ENUMS arena. */
const MOD_ENUM_IDX_SHIFT = 12;
/** Maximum value that fits in the 18-bit arena index field. */
const MOD_ENUM_IDX_MASK  = 0x3FFFF;

// ── MOD_ARRAY inline payload bits (bits 11-29) ──
/** Bit 11: uniqueItems flag. */
const MOD_ARRAY_UNIQUE_BIT      = 1 << 11;
/** Bits 12-21 (10 bits): maxItems (0 = no max). */
const MOD_ARRAY_MAX_ITEMS_SHIFT = 12;
const MOD_ARRAY_MAX_ITEMS_MASK  = 0x3FF;
/** Bits 22-29 (8 bits): minItems (0 = no min). */
const MOD_ARRAY_MIN_ITEMS_SHIFT = 22;
const MOD_ARRAY_MIN_ITEMS_MASK  = 0xFF;

// ── MOD_RECORD inline payload bits (bits 11-29) ──
/** Bits 11-21 (11 bits): maxProperties (0 = no max). */
const MOD_RECORD_MAX_PROPS_SHIFT = 11;
const MOD_RECORD_MAX_PROPS_MASK  = 0x7FF;
/** Bits 22-29 (8 bits): minProperties (0 = no min). */
const MOD_RECORD_MIN_PROPS_SHIFT = 22;
const MOD_RECORD_MIN_PROPS_MASK  = 0xFF;

// ── Inline STRING validator payload bits ──
/** Bits 9-16 (8 bits): regex cache index (0 = no pattern). */
const STR_REGEX_IDX_SHIFT = 9;
const STR_REGEX_IDX_MASK  = 0xFF;
/** Bits 17-24 (8 bits): maxLength (0 = no max). */
const STR_MAX_LEN_SHIFT   = 17;
const STR_MAX_LEN_MASK    = 0xFF;
/** Bits 25-29 (5 bits): minLength (0 = no min). */
const STR_MIN_LEN_SHIFT   = 25;
const STR_MIN_LEN_MASK    = 0x1F;

// ── Inline NUMBER/INTEGER validator payload bits ──
/** Bit 9: minimum bound present (allows min: 0 to be distinguished from "no min"). */
const NUM_HAS_MIN_BIT   = 1 << 9;
/** Bit 10: exclusive minimum flag (1 = >, 0 = >=). */
const NUM_EXCL_MIN_BIT  = 1 << 10;
/** Bit 11: exclusive maximum flag (1 = <, 0 = <=). */
const NUM_EXCL_MAX_BIT  = 1 << 11;
/** Bit 12: sign of minimum bound (1 = negative). */
const NUM_MIN_NEG_BIT   = 1 << 12;
/** Bit 13: sign of maximum bound (1 = negative). */
const NUM_MAX_NEG_BIT   = 1 << 13;
/** Bits 14-22 (9 bits): minimum magnitude (0-511). Only valid when NUM_HAS_MIN_BIT is set. */
const NUM_MIN_MAG_SHIFT = 14;
const NUM_MIN_MAG_MASK  = 0x1FF;
/** Bits 23-30 (8 bits): maximum magnitude (0 = no max, 1-255). */
const NUM_MAX_MAG_SHIFT = 23;
const NUM_MAX_MAG_MASK  = 0xFF;

// ── Evaluation tracking bit-packing ──
/** Shift to compute the 32-bit word index from a bit index: i >>> WORD_IDX_SHIFT. */
const WORD_IDX_SHIFT = 5;
/** Mask to extract the bit position within a 32-bit word: i & WORD_BIT_MASK. */
const WORD_BIT_MASK  = 31;
/** MSB sentinel that marks unknown keys in the evaluation tracking arena. */
const UNKNOWN_KEY_FLAG = 0x80000000;

/**
 * K_VALIDATOR: set on the KINDS header when a VALIDATORS entry is attached.
 * K_ANY_INNER: set on a KINDS header when the inner type is ANY (no registry entry).
 * Used for bare `type: "array"`, `type: "object"`, `record(ANY)`, etc.
 */
const K_VALIDATOR = 1 << 30;
const K_ANY_INNER = 1 << 29;

const K_STRICT = 1 << 28;
const K_HAS_ITEMS = 1 << 27;
/** K_HAS_REST marks that a K_TUPLE has a rest element stored as the last SLAB element. */
const K_HAS_REST = 1 << 26;
/** K_ALL_REQUIRED marks K_OBJECT shapes where every property is required (no OPTIONAL bits). */
const K_ALL_REQUIRED = 1 << 24;

// ── Complex KINDS enum (bits 0-3, values 0-14) ──
// The KINDS vtable header stores the enum in the lower 4 bits.
// Every kind has a unique value.
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
const K_UNEVALUATED = 14;

const KIND_ENUM_MASK = 0xF;

// --- Validator bit flags (globally unique, unified layout) ---
//
// Payload flags (bits 0–13): each set bit pushes exactly 1 Float64 to the payload slab.
// Offset of any payload flag's value = popcnt16(vHeader & (FLAG - 1))
//
// Zero-payload modifier flags (bits 14-15): toggle behavior on V_MINIMUM/V_MAXIMUM.
//
// Sequential payload flags (bits 16+): variable-length, use p++ to advance.
//
// K_PRIMITIVE vHeader is packed into bits 8-24 of the KINDS header word.
// All K_PRIMITIVE validator flags must fit within 17 bits (bits 0-16).
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
// Zero-payload modifier flags (outside V_PAYLOAD_MASK, no Float64 slot)
const V_EXCLUSIVE_MINIMUM = 1 << 14;
const V_EXCLUSIVE_MAXIMUM = 1 << 15;
/**
 * V_ENUM: variable-length enum membership payload for K_PRIMITIVE validators.
 * Payload layout (after fixed-slot payloads at base + popcnt16(vHeader & V_PAYLOAD_MASK)):
 *   If primBits & STRING: [ strCount, sortedKeyId0, ..., sortedKeyIdN ]
 *   If primBits & (NUMBER|INTEGER): [ numCount, sortedNum0, ..., sortedNumM ]
 *   If primBits & BOOLEAN: [ boolMask ] (bit 0 = true allowed, bit 1 = false allowed)
 *   Segments appear in order: string, number, boolean.
 */
const V_ENUM = 1 << 16;
// K_OBJECT variable-length payload flags (sequential p++ only, NOT popcount-compatible).
// These are only used by K_OBJECT (catalog API), never by K_PRIMITIVE (JSON Schema).
const V_DEPENDENT_REQUIRED = 1 << 17;
const V_PATTERN_PROPERTIES = 1 << 18;
const V_PROPERTY_NAMES = 1 << 19;
const V_DEPENDENT_SCHEMAS = 1 << 20;
const V_UNEVALUATED_ITEMS = 1 << 21;
const V_UNEVALUATED_PROPERTIES = 1 << 22;
// K_ARRAY zero-payload modifier flag
const V_UNIQUE_ITEMS = 1 << 29;
const V_ADDITIONAL_PROPERTIES = 1 << 30;

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
const FMT_DATE = 4;
const FMT_TIME = 5;
const FMT_DATETIME = 6;

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
    let strlen = str.length;
    for (let i = 0; i < strlen; i++) {
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
    COMPLEX, NULLABLE, OPTIONAL,
    ANY, NEVER, BOOLEAN,
    NUMBER, STRING, INTEGER,
    SIMPLE, VALUE, PRIM_MASK,
    MODIFIER, MOD_ARRAY, MOD_RECORD, MOD_ENUM, MOD_MASK,
    KINDS_SHIFT, V_PAYLOAD_MASK,
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
    WORD_IDX_SHIFT, WORD_BIT_MASK, UNKNOWN_KEY_FLAG,
    K_PRIMITIVE, K_OBJECT, K_ARRAY, K_RECORD,
    K_OR, K_EXCLUSIVE, K_INTERSECT,
    K_UNION, K_TUPLE, K_REFINE, K_NOT,
    K_CONDITIONAL, K_DYN_ANCHOR, K_DYN_REF, K_UNEVALUATED, K_ANY_INNER,
    KIND_ENUM_MASK, K_VALIDATOR, K_STRICT, K_HAS_ITEMS, K_HAS_REST, K_ALL_REQUIRED,
    V_MIN_LENGTH, V_MAX_LENGTH, V_PATTERN, V_FORMAT,
    V_MINIMUM, V_MAXIMUM, V_MULTIPLE_OF, V_EXCLUSIVE_MINIMUM, V_EXCLUSIVE_MAXIMUM,
    V_MIN_ITEMS, V_MAX_ITEMS, V_CONTAINS, V_MIN_CONTAINS, V_MAX_CONTAINS,
    V_UNIQUE_ITEMS, V_MIN_PROPERTIES, V_MAX_PROPERTIES, V_PATTERN_PROPERTIES, V_PROPERTY_NAMES,
    V_ADDITIONAL_PROPERTIES, V_DEPENDENT_REQUIRED,
    V_UNEVALUATED_ITEMS, V_UNEVALUATED_PROPERTIES, V_DEPENDENT_SCHEMAS,
    V_ENUM,
    popcnt16,
    FMT_EMAIL, FMT_IPV4, FMT_UUID, FMT_DATE, FMT_TIME, FMT_DATETIME, FMT_MAP,
    FMT_RE_EMAIL, FMT_RE_IPV4, FMT_RE_UUID, FMT_RE_DATETIME,
    FAIL, codepointLen, toString, hasOwnProperty
}

// Backward-compatible aliases
export { NULLABLE as NULL, OPTIONAL as UNDEFINED };
