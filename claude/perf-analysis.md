# Performance Analysis: B2B Benchmark (130k → 120k instructions)

## Benchmark Profile

**Schema**: 87 AST nodes, 82 property definitions across 14 object types, 6 array types, 9 enum types.

**Payload**: ~338 runtime property validations, ~56 `_validate` calls, ~70 `_validateInlinePrim` calls, ~13 enum checks, ~12 MOD_RECORD iterations, ~14 regex tests.

**Type distribution across all schema object properties**:
| Category | Count | Path |
|---|---|---|
| Bare STRING | 20 | inline typeof in K_OBJECT loop |
| Bare NUMBER | 7 | inline typeof in K_OBJECT loop |
| Bare BOOLEAN | 3 | inline typeof in K_OBJECT loop |
| Bare INTEGER | 1 | inline typeof in K_OBJECT loop |
| INLINE_PRIM (string maxLen, num min/max, regex) | 25 | `_validateInlinePrim()` function call |
| INLINE_MOD (enum, MOD_RECORD, MOD_ARRAY) | 12 | `_validateInlineMod()` function call |
| COMPLEX (K_OBJECT, K_ARRAY) | 14 | `_validate()` recursive call |

## How ajv achieves 40k instructions

The ajv compiled output is one monolithic function with **zero indirection**:

```js
// ajv: direct property access, no SLAB, no key lookup
if (data.orderId !== undefined) {
    let data0 = data.orderId;
    if (typeof data0 === "string") {
        if (func2(data0) > 64) { return false; }
    } else { return false; }
}
```

Per property: `data.propName` (1 IC lookup), `typeof` (1 op), comparison (1 op). ~5 effective instructions.

For enums, ajv inlines a chained `===` comparison: `data1 === "B2B" || data1 === "B2C" || ...`. No Set, no hash.

## Where uvd spends its 130k instructions

### The K_OBJECT property loop (lines 1470-1557) — THE hot path

Every property validation requires:
```js
let keyId = slab[base + (i << 1)];        // 1 shift, 1 add, 1 SLAB read
let key = KEY_INDEX[keyId];                // 1 array read
let type = slab[base + (i << 1) + 1];     // 1 shift, 1 add, 1 add, 1 SLAB read
let hasProp = hasOwnProperty.call(data, key);  // ~20-30 instructions (V8 C++ call)
let val = hasProp ? data[key] : void 0;    // 1 branch, 1 property lookup (~10 inst)
if (val === void 0) { ... }                // 1 comparison
// type dispatch                           // 5-15 instructions
```

**Estimated per-property cost**: ~50-65 instructions × 338 properties = ~17,000-22,000 instructions.

The `hasOwnProperty.call(data, key)` alone accounts for ~20-30 instructions per property (it's a C++ runtime call in V8, not a simple comparison). That's **6,800-10,000 instructions** just for hasOwnProperty across all 338 properties.

### Function call overhead for _validateInlinePrim

~70 calls at ~10 instructions call overhead + ~25 instructions body = ~2,450 instructions.

### _validate dispatch overhead

56 calls, each doing: COMPLEX bit check → null guard → ptr extraction → KINDS read → kind dispatch. ~25 instructions per call = ~1,400 instructions.

### MOD_RECORD for..in iterations

12 MOD_RECORD validations (11 item.attributes + 1 metadata), each using `for..in` to iterate properties. ~45 total property iterations at ~30 instructions each = ~1,350 instructions.

### Regex tests

14 regex `.test()` calls (1 createdAt, 1 email, 12 sku) at ~50-200 instructions each = ~1,000-2,800 instructions. These are unavoidable.

### Enum Set.has() checks

13 enum checks at ~15-20 instructions each (MOD_ENUM dispatch + _isValue + Set.has) = ~200-260 instructions.

---

## Optimization Opportunities

### 1. 🔥 Eliminate hasOwnProperty.call from the K_OBJECT property loop

**Estimated savings: 7,000-10,000 instructions (the single biggest win)**

Current code:
```js
let hasProp = hasOwnProperty.call(data, key);
let val = hasProp ? data[key] : void 0;
if (val === void 0) {
    if (type & OPTIONAL) {
        if (trackPtr && hasProp) {
            markEvaluated(trackPtr, snapPtr, keyId);
        }
        continue;
    }
    return false;
}
```

Proposed replacement:
```js
let val = data[key];
if (val === void 0) {
    if (type & OPTIONAL) {
        if (trackPtr && hasOwnProperty.call(data, key)) {
            markEvaluated(trackPtr, snapPtr, keyId);
        }
        continue;
    }
    return false;
}
```

**Why this is safe**: For JSON Schema data (from `JSON.parse`), properties never have value `undefined`. If `data[key] === undefined`, the property is absent. The `hasOwnProperty` call is deferred to the rare case where `trackPtr` is non-zero AND the type is optional AND the value is undefined — which means it's essentially never called in the hot path.

For the benchmark: 338 properties × 0 hasOwnProperty calls = 0 overhead (vs. current 338 calls).

### 2. Use a running SLAB pointer instead of indexed access

**Estimated savings: ~500-700 instructions**

Current code:
```js
for (let i = 0; i < length; i++) {
    let keyId = slab[base + (i << 1)];
    let type = slab[base + (i << 1) + 1];
```

Proposed:
```js
let p = base;
for (let i = 0; i < length; i++) {
    let keyId = slab[p];
    let type = slab[p + 1];
    p += 2;
```

Eliminates one shift and one addition per property (the `i << 1` and `base + ...`). V8's loop strength reduction might already do this, but the explicit form is clearer and more predictable.

### 3. Consider a K_OBJECT non-tracking fast path

**Estimated savings: ~300-500 instructions**

When `trackPtr === 0` (which is the case for 99%+ of validations), the `if (trackPtr)` check at the end of every property and the `if (trackPtr && hasProp)` in the optional branch are wasted comparisons. A dedicated non-tracking loop that omits these checks entirely would save ~1 comparison per property.

However, this would duplicate the entire K_OBJECT loop body. The tradeoff is code size vs. instruction count. One approach: split just the inner dispatch into a helper, keeping two thin outer loops. But V8 inlining heuristics make this tricky.

### 4. Inline string maxLength validation in K_OBJECT loop (speculative)

**Estimated savings: ~500-700 instructions**

INLINE_PRIM(STRING) is the most common inline type (25 of 82 schema properties). Each one currently requires a function call to `_validateInlinePrim`. If V8 doesn't inline it (likely, given its ~80-line body), that's ~10 instructions of call overhead per invocation.

A specialized fast path for the most common case (string with maxLength, no regex, no minLength) could be inlined into the K_OBJECT loop:

```js
} else if (!(type & MODIFIER) && (type & STRING)) {
    if (typeof val !== 'string') return false;
    let maxLen = (type >>> STR_MAX_LEN_SHIFT) & STR_MAX_LEN_MASK;
    if (maxLen > 0 && val.length > maxLen && codepointLen(val) > maxLen) return false;
    let regexIdx = (type >>> STR_REGEX_IDX_SHIFT) & STR_REGEX_IDX_MASK;
    if (regexIdx > 0 && !REGEX_CACHE[regexIdx].test(val)) return false;
```

This avoids the function call and its frame setup, while covering ~35% of inline prim calls. The tradeoff is code duplication.

**Alternative**: Keep `_validateInlinePrim` but restructure it to be V8-inlinable (< 30 bytecodes in the common path). Move the NUMBER/INTEGER/BOOLEAN paths into a cold helper so the string path fits V8's inlining budget.

### 5. Compiler: hoist enum validation into inline `===` chains for small enums

**Estimated savings: ~100-200 instructions**

ajv achieves this: `data === "B2B" || data === "B2C" || data === "WHOLESALE" || data === "INTERNAL"`. No Set.has overhead.

For uvd, small enums (≤ 4-5 values) could be compiled to a different representation. Instead of MOD_ENUM with a Set, encode the literal values directly. This avoids Set.has hashing overhead for small enums. For the 9 enum types in this schema, most have 4-6 values.

However, this requires string storage which contradicts the zero-allocation principle. The benefit is marginal (~10 instructions per enum check × 13 checks = 130 instructions).

### 6. Compiler: merge K_OBJECT + K_VALIDATOR for arrays into a single dispatch

**Estimated savings: ~100-200 instructions**

After validating all array items, the K_ARRAY code checks `if (header & K_VALIDATOR)` and calls `runArrayValidator`. The `runArrayValidator` then computes `popcnt16` for each validator flag. For simple validators (just minItems/maxItems), the popcnt16 computation is overkill.

The compiler could pre-compute the payload offsets and embed them directly. But this is architecture-deep and marginal.

---

## Priority Ranking

| # | Optimization | Savings | Risk | Effort |
|---|---|---|---|---|
| **1** | **Remove hasOwnProperty.call** | **~8,000-10,000** | Low (JSON data invariant) | Small |
| 2 | Running SLAB pointer | ~500-700 | None | Trivial |
| 3 | Non-tracking K_OBJECT fast path | ~300-500 | None (code size) | Medium |
| 4 | Inline string maxLen in K_OBJECT | ~500-700 | None (code size) | Medium |
| 5 | Small enum === chains | ~100-200 | Medium | High |
| 6 | Pre-computed array validator offsets | ~100-200 | Low | Medium |

**Optimization #1 alone should get us from ~130k to ~120-122k instructions.** Combined with #2, we should comfortably hit the 120k target.

---

## Data Appendix

### KINDS vtable for this schema (26 entries, stride-2)

```
KINDS[0]:  K_ARRAY  [K_ANY_INNER]       — bare array
KINDS[2]:  K_OBJECT [K_ANY_INNER]       — bare object
KINDS[4]:  K_RECORD [K_ANY_INNER]       — bare record
KINDS[6]:  K_OBJECT                     — auditTrail entry {action, timestamp, actor, ip?, details?}
KINDS[8]:  K_ARRAY  [K_HAS_ITEMS]       — auditTrail array → K_OBJECT[3]
KINDS[10]: K_OBJECT                     — riskAssessment {score, level, fraudSignals, ...}
KINDS[12]: K_OBJECT                     — transaction {id, amount, success, gatewayResponse}
KINDS[14]: K_ARRAY  [K_HAS_ITEMS]       — transactions array → K_OBJECT[6]
KINDS[16]: K_OBJECT                     — payment {method, status, totalAmount, ...}
KINDS[18]: K_OBJECT                     — trackingEvent {timestamp, location, message, eventCode?}
KINDS[20]: K_ARRAY  [K_HAS_ITEMS]       — trackingEvents → K_OBJECT[9]
KINDS[22]: K_OBJECT                     — dimensions {length, width, height}
KINDS[24]: K_OBJECT                     — fulfillment entry {packageId, carrier, ...}
KINDS[26]: K_ARRAY  [K_HAS_ITEMS, K_VALIDATOR] — fulfillment array (maxItems:100)
KINDS[28]: K_PRIMITIVE                  — string(maxLength:1000) for instructions
KINDS[30]: K_OBJECT                     — item {sku, name, description, ...}
KINDS[32]: K_ARRAY  [K_HAS_ITEMS, K_VALIDATOR] — items array (minItems:1, maxItems:1000)
KINDS[34]: K_PRIMITIVE                  — string(maxLength:255, pattern) for email
KINDS[36]: K_OBJECT [K_ALL_REQUIRED]    — billing.address {country, city}
KINDS[38]: K_OBJECT                     — billing {taxId, costCenter, address}
KINDS[40]: K_PRIMITIVE                  — number(min:0, max:100) for score
KINDS[42]: K_OBJECT                     — shipping {addressLine1, ..., instructions}
KINDS[44]: K_ARRAY  [K_HAS_ITEMS, K_VALIDATOR] — tags array (maxItems:50)
KINDS[46]: K_PRIMITIVE                  — string(maxLength:50) for tag items
KINDS[48]: K_OBJECT                     — customer {id, email, companyName, ...}
KINDS[50]: K_OBJECT                     — ROOT {orderId, orderType, ...}

### VALIDATORS heap (5 Float64 values)

[0] = 100  (riskAssessment.score maximum)
[1] = 1    (items minItems)
[2] = 1000 (items maxItems)
[3] = 1000 (? — possibly fulfillment maxItems or instructions maxLength)
[4] = 50   (tags maxItems or attributes maxProperties)
```
