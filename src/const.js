// --- BIT LAYOUT ---
// Bit 31:  COMPLEX   (0 = primitive typedef, 1 = complex typedef)
// Bit 30:  NULLABLE  (typedef accepts null)
// Bit 29:  OPTIONAL  (typedef accepts undefined)
// Bit 28:  VOLATILE  (typedef lives in volatile storage)
// Bits 0-27:
//   If COMPLEX=0: primitive type flags (up to 28 type slots)
//   If COMPLEX=1: index into KIND table

const COMPLEX = (1 << 31) >>> 0;
const NULLABLE = (1 << 30) >>> 0;
const OPTIONAL = (1 << 29) >>> 0;
const VOLATILE = (1 << 28) >>> 0;

const BOOLEAN = (1 << 27) >>> 0;
const NUMBER = (1 << 26) >>> 0;
const STRING = (1 << 25) >>> 0;
const BIGINT = (1 << 24) >>> 0;
const DATE = (1 << 23) >>> 0;
const URI = (1 << 22) >>> 0;
const INTEGER = (1 << 21) >>> 0;

const PRIMITIVE = (BOOLEAN | NUMBER | STRING | BIGINT | DATE | URI | INTEGER);
const PRIM_MASK = 0x0FFFFFFF;
const KIND_MASK = 0x0FFFFFFF;

// Complex kind enum (sequential, not bit flags)
const K_PRIMITIVE = 0;
const K_OBJECT = 1;
const K_ARRAY = 2;
const K_UNION = 3;
const K_REFINE = 4;
const K_TUPLE = 5;
const K_RECORD = 6;
const K_OR = 7;
const K_EXCLUSIVE = 8;
const K_INTERSECT = 9;
const K_NOT = 10;
const K_CONDITIONAL = 11;

const KIND_ENUM_MASK = 0xF;
const HAS_VALIDATOR = 1 << 4;

// --- Validator opt flags (scoped by context) ---

// String validator flags
const STR_MIN_LENGTH = 1;
const STR_MAX_LENGTH = 2;
const STR_PATTERN = 4;
const STR_FORMAT = 8;

// Number validator flags
const NUM_MINIMUM = 1;
const NUM_MAXIMUM = 2;
const NUM_EX_MIN = 4;
const NUM_EX_MAX = 8;
const NUM_MULTIPLE_OF = 16;

// Array validator flags
const ARR_MIN_ITEMS = 1;
const ARR_MAX_ITEMS = 2;
const ARR_UNIQUE = 4;
const ARR_CONTAINS = 8;
const ARR_MIN_CONTAINS = 16;
const ARR_MAX_CONTAINS = 32;

// Object validator flags
const OBJ_MIN_PROPS = 1;
const OBJ_MAX_PROPS = 2;
const OBJ_PATTERN_PROPS = 4;
const OBJ_PROP_NAMES = 8;
const OBJ_DEP_REQUIRED = 16;
const OBJ_NO_ADDITIONAL = 32;

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

const STRIP = true;
const PLAIN = true;
const NOT_STRICT = 0;
const STRICT_REJECT = 1;
const STRICT_DELETE = 2;
const STRICT_PROTO = 4;
const STRICT_MODE_MASK = 0b11;

const U8 = 1;
const U16 = 2;
const U32 = 3;

/** @const @type {symbol} */
const FAIL = Symbol('FAIL');

export { 
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
    FMT_RE_EMAIL, FMT_RE_IPV4, FMT_RE_UUID, FMT_RE_DATETIME,
    STRIP, PLAIN, NOT_STRICT, STRICT_REJECT, STRICT_DELETE, STRICT_PROTO,
    STRICT_MODE_MASK, U8, U16, U32, FAIL
}

// Backward-compatible aliases
export { NULLABLE as NULL, OPTIONAL as UNDEFINED };