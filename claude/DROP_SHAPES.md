# KINDS Stride-2 Refactor Plan

## Goal
- Eliminate the SHAPES indirection layer entirely
- Store slab offset directly in KINDS at `ptr*2 + 1`
- Store `vHeader` in KINDS (Uint32) instead of VALIDATORS (Float64)
- Store `val_ptr` in KINDS pointing directly to first payload in VALIDATORS
- Prefix SLAB entries with their own length word
- Adjust typedef encoding so `typedef >>> 2` yields the KINDS base index

## New Layouts

### KINDS (Uint32Array)
Every logical entry is identified by a `ptr` (logical index). The raw KINDS array index is always `ptr * 2`.

Without validator (K_VALIDATOR not set):
```
KINDS[ptr*2]     = kind_enum | meta_bits
KINDS[ptr*2 + 1] = slab_offset
```

With validator (K_VALIDATOR set):
```
KINDS[ptr*2]     = kind_enum | meta_bits | K_VALIDATOR
KINDS[ptr*2 + 1] = slab_offset
KINDS[ptr*2 + 2] = vHeader  (Uint32 bitmask, was Float64 VALIDATORS[valIdx])
KINDS[ptr*2 + 3] = val_ptr  (offset into VALIDATORS, points to first payload)
```

### SLAB (Uint32Array)
Every entry is now length-prefixed:
```
SLAB[offset]     = length  (semantic count, e.g. property count for K_OBJECT)
SLAB[offset + 1] = first data word
SLAB[offset + 2] = second data word
...
```

K_OBJECT data (after length word):
```
SLAB[offset + 1 + i*2]     = keyId
SLAB[offset + 1 + i*2 + 1] = type
```

K_ARRAY, K_NOT, K_RECORD: no SLAB entry (inline in KINDS slot 1 as before, length word not needed).

K_OR, K_EXCLUSIVE, K_INTERSECT, K_TUPLE, K_UNION, K_CONDITIONAL, K_REFINE, K_DYN_ANCHOR, K_UNEVALUATED: all prefixed with length word.

### VALIDATORS (Float64Array)
Starts directly at first payload. vHeader is no longer stored here.
```
VALIDATORS[val_ptr + 0] = payload0
VALIDATORS[val_ptr + 1] = payload1
...
```

Variable-length payloads (V_DEPENDENT_REQUIRED, V_PATTERN_PROPERTIES etc.) continue to store their own inline length counts, exactly as now. popcnt16(vHeader & 0xFFFF) gives fixed-slot count; variable sections follow sequentially after.

## Typedef Encoding Change

Old: `(1 | (ptr << 3))` where ptr is raw KINDS array index → decode: `typedef >>> 3`
New: `(1 | (ptr << 2))` where ptr is logical index → decode: `typedef >>> 2`, raw KINDS index = `(typedef >>> 2) * 2`

Bit layout (unchanged low bits):
```
bit 0: COMPLEX
bit 1: NULLABLE
bit 2: OPTIONAL
bits 3+: logical ptr (was bits 3+, now same bits but ptr is logical not raw)
```

This doubles the addressable ptr space: was 2^29 raw slots, now 2^29 logical entries each potentially 4 raw slots.

Wait — bit 2 is OPTIONAL, so ptr starts at bit 3 still. Decode is:
```js
let ptr = typedef >>> 3;          // logical ptr (same as before)
let kindsIdx = ptr * 2;           // raw KINDS array index (new)
let header = KINDS[kindsIdx];
let slabOffset = KINDS[kindsIdx + 1];
let length = SLAB[slabOffset];    // new: length is first word
// data: SLAB[slabOffset + 1 ...]
```

No encoding change needed. The doubling comes from `ptr * 2` mapping to a 4-slot max entry, so logical ptr space is `KIND_LEN / 2` entries instead of `KIND_LEN / 3` (old worst case with validator).

## Step-by-Step Changes

### Step 1 — const.js
- No bit constant changes needed
- Add a comment clarifying that KINDS is now stride-2 per logical ptr
- `K_VALIDATOR` bit meaning unchanged: gates slots 2 and 3

### Step 2 — catalog.js: createHeap()
- Remove `SHAPES`, `SHAPE_LEN`, `SHAPE_COUNT` from heap object
- KINDS initial size can shrink slightly (no longer needs 3-slot worst case padding)
- Pre-allocated boot entries (BARE_ARRAY, BARE_OBJECT, BARE_RECORD) change:

Old:
```js
KINDS[0] = K_ARRAY | K_ANY_INNER;
KINDS[1] = K_OBJECT | K_ANY_INNER;
KINDS[2] = K_RECORD | K_ANY_INNER;
HEAP.KIND_PTR = 3;
```

New (these have no SLAB entry, slab_offset = 0 as sentinel):
```js
KINDS[0] = K_ARRAY | K_ANY_INNER;   // logical ptr 0, kindsIdx 0
// KINDS[1] = 0;                        slab_offset unused, 0 sentinel, 0 is set implicit in the typed array, no need to set it manually
KINDS[2] = K_OBJECT | K_ANY_INNER;  // logical ptr 1, kindsIdx 2
// KINDS[3] = 0;
KINDS[4] = K_RECORD | K_ANY_INNER;  // logical ptr 2, kindsIdx 4
// KINDS[5] = 0;
HEAP.KIND_PTR = 6;                   // next logical ptr = 3, kindsIdx = 6
```

Update BARE_ARRAY / BARE_OBJECT / BARE_RECORD encoding:
```js
export const BARE_ARRAY  = (COMPLEX | (0 << 3)) >>> 0;  // logical ptr 0
export const BARE_OBJECT = (COMPLEX | (1 << 3)) >>> 0;  // logical ptr 1
export const BARE_RECORD = (COMPLEX | (2 << 3)) >>> 0;  // logical ptr 2
```

### Step 3 — allocate.js: malloc()
Replace all SHAPES reads/writes with SLAB length-prefix pattern.

Old:
```js
let ri = HEAP.SHAPE_COUNT++;
HEAP.SHAPES[ri * 2] = offset;
HEAP.SHAPES[ri * 2 + 1] = shapeLen;
// stored ri in KINDS[ptr+1]
```

New:
```js
// Write length as first word in SLAB before the data
// offset is already the position where we're about to write
SLAB[offset] = shapeLen;
// slabData already written at offset+1 via SLAB.set(slabData, offset+1)
// store slab_offset directly in KINDS
```

Adjust SLAB.set call: write slabData starting at `offset + 1`, reserve slot 0 for length.
Adjust `HEAP.PTR` advance: `HEAP.PTR += count + 1` (extra word for length prefix).

KINDS write changes:

Old (no validator, 2 slots):
```js
HEAP.KINDS[ptr] = header;
HEAP.KINDS[ptr + 1] = ri;          // ri = SHAPES index
```

New (no validator, 2 slots):
```js
let kindsIdx = HEAP.KIND_PTR;
HEAP.KINDS[kindsIdx]     = header;
HEAP.KINDS[kindsIdx + 1] = offset; // direct slab offset
HEAP.KIND_PTR += 2;
```

Old (with validator, 3 slots):
```js
HEAP.VALIDATORS[valIdx] = vHeader;           // Float64
HEAP.VALIDATORS.set(vPayloads, valIdx + 1);
HEAP.KINDS[ptr]     = header | K_VALIDATOR;
HEAP.KINDS[ptr + 1] = ri;
HEAP.KINDS[ptr + 2] = valIdx;
```

New (with validator, 4 slots):
```js
// vHeader moves to KINDS, payloads start at val_ptr
let val_ptr = HEAP.VAL_PTR;
HEAP.VALIDATORS.set(vPayloads, val_ptr);     // payloads only, no header
HEAP.VAL_PTR += vPayloads.length;

let kindsIdx = HEAP.KIND_PTR;
HEAP.KINDS[kindsIdx]     = header | K_VALIDATOR;
HEAP.KINDS[kindsIdx + 1] = offset;           // slab offset
HEAP.KINDS[kindsIdx + 2] = vHeader;          // Uint32, was Float64
HEAP.KINDS[kindsIdx + 3] = val_ptr;          // first payload offset
HEAP.KIND_PTR += 4;
```

Return value encoding unchanged: `(COMPLEX | (ptr << 3)) >>> 0` where `ptr = kindsIdx / 2`.

### Step 4 — catalog.js: _validate() hot path

Old KINDS decode:
```js
let ptr = typedef >>> 3;
let header = kinds[ptr];
let ct = header & KIND_ENUM_MASK;
let ri = kinds[ptr + 1];
// then: shapes[ri * 2] and shapes[ri * 2 + 1]
```

New KINDS decode:
```js
let ptr = typedef >>> 3;
let kindsIdx = ptr * 2;            // or ptr << 1
let header = kinds[kindsIdx];
let ct = header & KIND_ENUM_MASK;
let slabOffset = kinds[kindsIdx + 1];
let length = slab[slabOffset];     // length is now first word
// data: slab[slabOffset + 1 ...]
```

K_OBJECT loop offset adjustments:
```js
// Old:
let offset = shapes[ri * 2];
let length = shapes[ri * 2 + 1];
slab[offset + (i << 1)]      // keyId
slab[offset + (i << 1) + 1]  // type

// New:
let length = slab[slabOffset];
slab[slabOffset + 1 + (i << 1)]      // keyId
slab[slabOffset + 1 + (i << 1) + 1]  // type
```

Validator read changes:

Old:
```js
// K_VALIDATOR path: kinds[ptr+2] = valIdx
let valIdx = kinds[ptr + 2];
let vHeader = validators[valIdx] | 0;   // Float64 read
let base = valIdx + 1;
```

New:
```js
// K_VALIDATOR path: kinds[kindsIdx+2] = vHeader, kinds[kindsIdx+3] = val_ptr
let vHeader = kinds[kindsIdx + 2] | 0;  // Uint32 read, cheaper
let val_ptr = kinds[kindsIdx + 3];
let base = val_ptr;                      // payloads start directly here
```

All `popcnt16` offset calculations remain identical — they use `base` as the starting offset, which now points directly to first payload instead of `valIdx + 1`.

### Step 5 — catalog.js: runPrimValidator(), runArrayValidator(), runObjectValidator()
These all receive `valIdx` today. Change signature to receive `vHeader` and `val_ptr` directly, since they're now read from KINDS before the call. Saves one Float64 load at the call site.

Old:
```js
function runPrimValidator(value, primBits, valIdx) {
    let vals = VALIDATORS;
    let vHeader = vals[valIdx] | 0;
    let base = valIdx + 1;
```

New:
```js
function runPrimValidator(value, primBits, vHeader, val_ptr) {
    let vals = VALIDATORS;
    let base = val_ptr;
```

Update all call sites accordingly.

### Step 6 — catalog.js: _validateRareKind()
Same KINDS decode changes as Step 4. All `shapes[ri * 2]` / `shapes[ri * 2 + 1]` reads become `slab[slabOffset]` / direct offset arithmetic. Apply mechanically to every case in the switch.

### Step 7 — error.js and transform.js
Both files access `hp.SHAPES` and use `shapes[ri * 2]` / `shapes[ri * 2 + 1]`. Apply the same mechanical replacement. Remove `SHAPES` from the heap object they receive.

### Step 8 — ast.js: compile()
The compile function calls `malloc()` which handles KINDS/SLAB writes internally. The compile function itself reads `HEAP.KINDS` and `HEAP.SLAB` only for circular patch logic:

```js
// circular $ref patch — update to use kindsIdx = ptr * 2
HEAP.KINDS[kindPtr * 2]     = kindHeader;
HEAP.KINDS[kindPtr * 2 + 1] = 0;  // no slab for promoted primitives
```

Where `kindPtr` was previously a raw KINDS index — confirm whether it stores logical ptr or raw index and adjust accordingly.

### Step 9 — Remove SHAPES entirely
- Remove `SHAPES`, `SHAPE_LEN`, `SHAPE_COUNT` from `createHeap()`
- Remove `resizeShapes()` function
- Remove `resizeShapes` from `__heap` object
- Remove all `ctx.resizeShapes(buffer)` calls in `malloc()`
- Remove SHAPES resize logic in `malloc()`

## Validation / Testing Checklist
- [ ] All existing bun:test tests pass unchanged
- [ ] BARE_ARRAY / BARE_OBJECT / BARE_RECORD typedef values unchanged (same bit pattern)
- [ ] Stress test: register schemas up to KIND_LEN limit, verify no OOB
- [ ] Validator payloads: string minLength/maxLength/pattern, number min/max, array contains
- [ ] Variable-length validators: dependentRequired, patternProperties
- [ ] Discriminated unions (K_UNION) — slab layout uses length as first word
- [ ] Circular $ref schemas — patch logic in ast.js uses correct kindsIdx
- [ ] K_UNEVALUATED tracking still works end to end