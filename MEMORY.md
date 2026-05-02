# MEMORY.md — uvd Project State Snapshot
> Last updated: 2026-03-27
> Branch: `master` | Commit: `88a752e`
> Test baseline: **5286 pass, 61 skip, 0 fail** across 5347 tests in 16 files

## What is uvd?

`uvd` is a zero-allocation type validation library (like Zod/Valibot/Ajv) that stores all type definitions as raw `Uint32Array` memory on managed heaps. Every typedef is a plain JavaScript number (a pointer into the heap). The user-facing API fakes TypeScript generics via JSDoc — the project is pure JS, no TS compilation.

## The #1 Constraint: V8 Smi Safety

**Every number that flows through validation must stay within V8's Small Integer (Smi) range** (~2^30 on 64-bit with pointer compression). Numbers outside this range get boxed as HeapNumbers (~16 bytes heap allocation per read), destroying the zero-allocation property. This means:

- SLAB, SHAPES, KINDS are `Uint32Array` (reading from typed arrays returns Smis if values fit)
- VALIDATORS is `Float64Array` (OK because validator values like min/max can be floats, and these are only read during validator checks, not the hot path)
- **No 53-bit mantissa encoding** — this was tried and reverted, it caused HeapNumber boxing
- **No `(1 << 31) >>> 0` bits on typedef pointers** — sign bit triggers HeapNumber

## Architecture Overview

### Typedef Pointer (a plain JS number, max 30 bits: 0-29)
```
Bits 0-2:  COMPLEX(0) | NULLABLE(1) | OPTIONAL(2)
Bits 3-7:  Primitive type flags (ANY=3, STRING=4, NUMBER=5, INTEGER=6, BOOLEAN=7)
           When COMPLEX=1: bits 3+ are KINDS array index (typedef >>> 3)
Bit  8:    MODIFIER flag (inline modifier encoding)
Bits 9-10: Modifier type: MOD_ARRAY(0), MOD_RECORD(1), MOD_ENUM(2)

When MODIFIER=1, MOD_ENUM:
  Bit 11:     isSet (0=CONSTANTS, 1=ENUMS arena)
  Bits 12-29: arena index (18 bits, max 262143)

When MODIFIER=1, MOD_ARRAY (homogeneous array, e.g. string[]):
  Bit 11:      UNIQUE flag
  Bits 12-21:  maxItems (10 bits, 0=no max, 1-1023)
  Bits 22-29:  minItems (8 bits, 0=no min, 1-255)

When MODIFIER=1, MOD_RECORD (Record<string, T>):
  Bits 11-21:  maxProperties (11 bits, 0=no max, 1-2047)
  Bits 22-29:  minProperties (8 bits, 0=no min, 1-255)

When MODIFIER=0, STRING (inline string validator):
  Bits 9-16:   regexIdx (8 bits, 0=no pattern, 1-255 into REGEX_CACHE)
  Bits 17-24:  maxLength (8 bits, 0=no max, 1-255)
  Bits 25-29:  minLength (5 bits, 0=no min, 1-31)

When MODIFIER=0, NUMBER/INTEGER (inline number validator):
  Bit 9:       EXCLUSIVE_MIN (0=>=, 1=>)
  Bit 10:      EXCLUSIVE_MAX (0=<=, 1=<)
  Bit 11:      MIN_NEGATIVE (0=positive, 1=negative)
  Bit 12:      MAX_NEGATIVE (0=positive, 1=negative)
  Bits 13-21:  minMagnitude (9 bits, 0=no min, 1-511)
  Bits 22-29:  maxMagnitude (8 bits, 0=no max, 1-255)
```

### Memory Layout
```
KINDS       [Uint32Array]  — stride-2 vtable: [header, slabOffset] per entry
                             With K_VALIDATOR: [header, slabOffset, vHeader, valPtr]
SLAB        [Uint32Array]  — length-prefixed bulk storage: [length, data...]
VALIDATORS  [Float64Array] — payloads only (vHeader moved to KINDS)
CONSTANTS   [Array<*>]     — const values for MOD_ENUM (isSet=0)
ENUMS       [Array<Set>]   — enum Sets for MOD_ENUM (isSet=1), uses Set.has()
```

SHAPES array has been eliminated. KINDS slot 1 stores slab offset directly;
SLAB entries are prefixed with their semantic length.

### KINDS Stride-2 Layout
```
Logical ptr = kindsIdx / 2.  Raw kindsIdx = (typedef >>> 3) << 1.
Without validator (2 slots):
  KINDS[kindsIdx]     = header (kind enum | meta bits)
  KINDS[kindsIdx + 1] = slab_offset (or inline value for K_ARRAY/K_NOT/K_RECORD)
With K_VALIDATOR set (4 slots):
  KINDS[kindsIdx + 2] = vHeader (Uint32 bitmask)
  KINDS[kindsIdx + 3] = val_ptr (offset into VALIDATORS, first payload)
```

### KINDS Header Bit Layout (upper bits)
```
K_VALIDATOR  = 1 << 30  — has attached VALIDATORS entry (expands to 4 KINDS slots)
K_ANY_INNER  = 1 << 29  — inner type is ANY (bare array/object/record)
K_STRICT     = 1 << 28  — strict mode (no extra properties/items)
K_HAS_ITEMS  = 1 << 27  — array has items type
K_HAS_REST   = 1 << 26  — tuple has rest element (last SLAB element)
Bits 0-3:    KIND enum (K_OBJECT=1, K_ARRAY=2, ..., K_UNEVALUATED=14)
```

### KINDS Enum Values
```
K_PRIMITIVE=0, K_OBJECT=1, K_ARRAY=2, K_RECORD=3,
K_OR=4, K_EXCLUSIVE=5, K_INTERSECT=6, K_UNION=7,
K_TUPLE=8, K_REFINE=9, K_NOT=10, K_CONDITIONAL=11,
K_DYN_ANCHOR=12, K_DYN_REF=13, K_UNEVALUATED=14
```

### Validator Header Bit Layout
```
Payload flags (bits 0-13): each set bit = 1 Float64 payload slot
  V_MIN_LENGTH(0), V_MAX_LENGTH(1), V_PATTERN(2), V_FORMAT(3),
  V_MINIMUM(4), V_MAXIMUM(5), V_MULTIPLE_OF(6),
  V_MIN_ITEMS(7), V_MAX_ITEMS(8), V_CONTAINS(9), V_MIN_CONTAINS(10), V_MAX_CONTAINS(11),
  V_MIN_PROPERTIES(12), V_MAX_PROPERTIES(13)

Variable-length flags (bits 16-22): sequential p++ only
  V_DEPENDENT_REQUIRED(16), V_PATTERN_PROPERTIES(17), V_PROPERTY_NAMES(18),
  V_DEPENDENT_SCHEMAS(19), V_UNEVALUATED_ITEMS(20), V_UNEVALUATED_PROPERTIES(21),
  V_ENUM(22) — sorted binary-search payload for enum matching

Boolean flags (bits 27-30): no payload
  V_EXCLUSIVE_MINIMUM(27), V_EXCLUSIVE_MAXIMUM(28),
  V_UNIQUE_ITEMS(29), V_ADDITIONAL_PROPERTIES(30)
```

## Source Files

| File | Purpose |
|------|---------|
| `src/internal/const.js` | All bit constants, K_ enums, V_ flags, format regexes |
| `src/internal/catalog.js` | Core engine: `_validate`, `_validateSlot`, `_validateModEnum`, `runPrimValidator`, `runObjectValidator`, `runArrayValidator`, `allocConstant`, `allocEnumSet`, key dictionary |
| `src/internal/allocate.js` | `malloc` + DSL builders: `objectImpl`, `arrayImpl`, `tupleArrayImpl`, `literalImpl`, `enumImpl`, `orImpl`, `intersectImpl`, `refineImpl`, `recordImpl` |
| `src/internal/schema.js` | JSON Schema parser → flat AST (CompoundSchema) |
| `src/internal/ast.js` | AST compiler → SLAB/KINDS/VALIDATORS allocation |
| `src/internal/validator.js` | `packValidators` — converts DSL options to validator headers + payloads |
| `src/internal/error.js` | `diagnose` — error message generation (mirrors validate logic) |
| `src/internal/util.js` | Shared helpers: `_isValue`, `sortByKeyId`, `deepEqual`, `parseValue` |

## Key Validation Dispatch

```
_validate(data, typedef)
  ├─ undefined → OPTIONAL check
  ├─ null → NULLABLE check
  ├─ COMPLEX bit set → switch(header & KIND_ENUM_MASK)
  │   ├─ K_PRIMITIVE → _isValue + runPrimValidator (V_ENUM binary search, etc.)
  │   ├─ K_OBJECT → runObjectValidator (for..in loop, binary search SHAPES)
  │   ├─ K_ARRAY → element validation + runArrayValidator
  │   ├─ K_TUPLE → prefix items + K_HAS_REST rest element
  │   ├─ K_OR/K_EXCLUSIVE/K_INTERSECT → branch iteration
  │   └─ ... other kinds
  ├─ typedef > 0xFF → _validateInline:
  │   ├─ MODIFIER=1, MOD_ENUM → CONSTANTS[idx] === data or ENUMS[idx].has(data)
  │   ├─ MODIFIER=1, MOD_ARRAY → Array.isArray + _isValue per element + min/max/unique
  │   ├─ MODIFIER=1, MOD_RECORD → object check + _isValue per value + min/maxProperties
  │   ├─ MODIFIER=0, STRING → minLength/maxLength/regex check
  │   └─ MODIFIER=0, NUMBER/INTEGER → min/max magnitude with exclusive/negative flags
  └─ bare primitive → _isValue(data, primBits)
```

## Build & Test

```bash
bun make     # MUST run before tests — tests target dist/ bundle
bun test     # Run all tests
```

## What Was Recently Completed

### K_HAS_REST (moved from bit 31)
REST was `(1 << 31) >>> 0` stored inline on SLAB tuple elements. This was problematic (sign bit, near overflow). Now:
- `K_HAS_REST = 1 << 26` on the KINDS header (same pattern as K_HAS_ITEMS)
- Rest type is stored as a normal SLAB element (last element), no bit masking needed
- Updated in: `const.js`, `ast.js`, `catalog.js`, `error.js`, `transform.js`

### CONSTANTS & ENUMS Arenas (added back)
After the failed Float64Array/53-bit refactor was reverted, these arenas were lost. Re-added:
- `CONSTANTS[]` — stores individual const values, accessed via `===`
- `ENUMS[]` — stores `Set` objects, accessed via `Set.has()`
- `MOD_ENUM` typedef encoding: `primBits | MODIFIER | MOD_ENUM | (isSet << 11) | (idx << 12)`
- All values stay within V8 Smi range (18-bit index, max 262143)
- `literalImpl` uses MOD_ENUM+CONSTANTS for true/false/string/number literals
- `enumImpl` uses MOD_ENUM+ENUMS (Set) for single-type enum fast-path, falls back to V_ENUM binary search

## Known Issues / Future Work

### Things NOT to add back
- **No 53-bit mantissa encoding** — proven incompatible with 0-alloc goal
- **No Float64Array SLAB** — must stay Uint32Array
- **No bit 30 or 31 on typedef pointers** — must stay within V8 Smi range (bits 0-29)
- **No MOD_ARRAY inlining in the AST compiler** — breaks unevaluated items/properties tracking

### Backup Files
- `backup/` and `stash_backup/` contain implementation files from the reverted Float64Array era
- `claude/` contains task descriptions (OBJECT_VALIDATOR.md, CONST_ENUM.md, etc.)
- `completed/` contains finished task documents

## Code Style Rules (from CLAUDE.md)
- Always expand branches fully (`if (x) { return y; }`, never one-liners)
- Use `number`/`boolean` constants instead of strings for enums
- Avoid heap allocations: prefer code duplication over allocating arrays/strings
- Write meaningful JSDoc comments
- Pure JavaScript with JSDoc type annotations (no TypeScript)
