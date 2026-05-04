# boer

boer is a JSON Schema compliant type validation library for JavaScript. It passes 100% of the official [JSON Schema test suite](https://github.com/json-schema-org/JSON-Schema-Test-Suite), but the library is mostly AI-assisted built, and I wouldn't say it's ready for production. Basically, it's still early, and this repo is just a proof of concept of the architecture and the general ideas. It was also a good learning process to implement it from scratch.

## Why

So, first of all, ajv is an amazing library. For many cases, just use ajv; it's widely supported and much faster than boer in raw throughput. However, ajv has some drawbacks, notably:

1. It relies on `eval / new Function`, which in many environments is disallowed for security reasons. It offers standalone code, but compiling many schemas becomes tedious, and they swell in size.
2. ajv compiler is very slow. For long lived applications, this doesn't matter, but parsing large schemas means cold-boot starts take a hit. For short-lived applications, it's even worse. If you're spinning up small lambda functions that just live a few minutes, the overhead of parsing schemas at boot, or shipping large standalone javascript files, starts adding up.
3. Re-compiling ajv schemas make CI tools quite slow.
4. ajv supports draft 2020, but the default is still draft 7.

boer is basically a mix between Zod and Ajv. Some of the main features are:

1. Full support for drafts 4 through 2020 of JSON Schema, including the more advanced concepts like $dynanchor, $dynref and unevaluated items/properties.
2. Fast performance and low memory allocation. boer is an interpreter, not a codegen compiler, so it will never be as fast as libraries like ajv, but it aims to narrow the gap.
3. A generic AST allowing boer to be extended to Open API spec etc.
4. A convenient, Typescript friendly DSL like Zod, with support for `Infer`.
5. It compiles schemas to binaries. For instance, the CloudFormation Schema generates 35.6 MB minified JavaScript with ajv standalone, taking 6.4 seconds to compile. boer parses the same schema to a binary file in 103 ms, and outputs a 259 kb binary file that you can instantly load into memory.

## Quick example

```ts
import { 
  object, string, number, array, union,
  literal, or, optional, validate, diagnose
} from 'boer';

const Payment = object({
  id: string(),
  userId: or(string(), number()),
  paymentMethod: union('type', {
    card: object({
      type: literal('card'),
      cardNo: string(),
    }),
    paypal: object({
      type: literal('paypal'),
      email: string(),
    }),
  }),
  tags: array(string()),
  comment: optional(string()),
});

const data = {
  id: 123,           // wrong, should be string
  userId: 'user_1',
  paymentMethod: {
    type: 'card',
    cardNo: 4242,    // wrong, should be string
  },
  tags: ['ok', 123], // second item invalid
};

if (!validate(data, Payment)) {
  console.log(diagnose(data, Payment));
  // [{ path: '.id', message: '...' }, ...]
}
```

## What it supports

**Primitives:** `string`, `number`, `boolean`, `null`, `undefined`, `any`, `never`

**Structural types:** `object`, `array`, `tuple`, `record`

**Composition:** `union` (discriminated), `or`, `exclusive` (oneOf), `intersect` (allOf), `not`, `when` (if/then/else)

**Validators:** `minLength`, `maxLength`, `pattern`, `format`, `minimum`, `maximum`, `exclusiveMinimum`, `exclusiveMaximum`, `multipleOf`, `minItems`, `maxItems`, `uniqueItems`, `contains`, `minProperties`, `maxProperties`, `patternProperties`, `additionalProperties`, `dependentRequired`

**Other:** `literal`, `refine` (custom validator functions), `nullable`, `optional`

## JSON Schema

boer can parse and validate against JSON Schema directly, supporting Draft 4, 6, 7, 2019-09 and 2020-12. This includes `$ref`, `$defs`, `$anchor`, `$dynamicRef`, `unevaluatedItems`, `unevaluatedProperties`, and the rest of the spec.

```ts
import { catalog } from '@boer/validate';
import { parseJSONSchema } from '@boer/schema';
import { compile } from '@boer/compiler';

const cat = catalog();
const ast = parseJSONSchema(mySchema);
const typedef = compile(cat, ast);

cat.validate(data, typedef);
```

## Binary serialization

boer can serialize a compiled catalog to a binary format and load it back. This is the main mechanism for fast cold starts: parse and compile your schemas at build time, ship the binary, and load it at runtime without any schema processing.

```ts
import { dump, load } from '@boer/inspect';

// At build time
const buffer = dump(catalog);

// At runtime, no parsing or compilation needed
const restored = load(buffer);
```

## How it works

Every type in boer is a plain JavaScript number. The core idea is that a 32-bit unsigned integer can encode both what a type *is* and how to *validate* it, without any heap allocation. With a caveat: V8 uses one bit to indicate object vs primitive type. So, boer tries to avoid allocating the last 32nd bit, and stay within 31 bits which is the stack alloc limit.

### The typedef pointer

The lowest bits of every typedef carry metadata:

```
Bit 0:   COMPLEX    (0 = primitive, 1 = complex pointer)
Bit 1:   NULLABLE   (type accepts null)
Bit 2:   OPTIONAL   (type accepts undefined)
Bits 3+: payload    (meaning depends on COMPLEX bit)
```

When COMPLEX is 0, bits 3-7 are primitive type flags (`STRING`, `NUMBER`, `INTEGER`, `BOOLEAN`, `ANY`). When COMPLEX is 1, bits 3+ are a raw pointer into the KINDS vtable.

### Inlined primitive validators

For primitives, bits 8-31 encode validator constraints directly into the number. boer compiles `string` with `maxLength: 20` into a single number, using the lower bits as type info, and the higher bits to encode the validation payload.

```
Bits 0-8:   type flags (STRING | NULLABLE | OPTIONAL)
Bits 9-16:  regex cache index (0 = no pattern)
Bits 17-25: maxLength (0 = none, up to 511)
Bits 26-31: minLength (0 = none, up to 63)
```

Numbers have a similar layout encoding minimum/maximum bounds with sign bits. If a validator doesn't fit (e.g. `maxLength: 1000` exceeds the 9-bit field), it falls back to a heap-allocated validator.

Enums with a single value compile to a const match against the global string dictionary. Multi-value enums compile to a `Set.has()` check. Both are encoded inline using the MOD_ENUM modifier bits.

### The KINDS vtable

Complex types (objects, arrays, unions, etc.) live on a `Uint32Array` heap called the KINDS vtable. Each entry is stride-2:

```
[kind_header, slab_pointer]
```

The `kind_header` contains the kind enum (K_OBJECT, K_ARRAY, K_OR, etc.) in the low bits, plus flag bits like K_STRICT (additionalProperties: false), K_ALL_REQUIRED, and K_VALIDATOR.

When a complex type has validators (e.g. an object with `maxProperties` or `patternProperties`), the entry grows to stride-4:

```
[kind_header, slab_pointer, validator_header, validator_pointer]
```

The validator header is a bitmask of which validators are present, and the validator pointer indexes into a separate `Float64Array` where the payloads live. Some fast path optimizations exist, such as with only `additionalProperties: false`, which skips the validator entirely and uses the K_STRICT flag bit instead, keeping them at stride-2.

### The SLAB

Object properties are stored on a flat `Uint32Array` slab as sorted `[keyId, typeId]` pairs. Every string in boer is stored in an internal dictionary, keeping an auto-incrementing seed. So for instance, the string "firstName" gets id 17, and then any subsequent equal string just reuses that id.

```
SLAB: [length, keyId, typeId, keyId, typeId, ...]
```

The typeId is either a complex pointer somewhere else on the slab, or just a raw primitive type that is validated against directly without indirection, using only bitwise operators to test different cases.

### Binary serialization

boer is optimized in two dimensions: memory and storage. The binary serialization is one of the strongest features: it can take a full JSON Schema, and compile it to a single binary file, which massively reduces the total size, and also allows basically instant cold boots. The binary just contains raw, dumped data from the internal heap with offsets, so on load, it basically does the equivalent of `memcpy` by writing to the `Uint32Array` straight from the buffer.

## Benchmarks

### Runtime validation

Benchmarked against a ~15 KB B2B logistics payload with a realistic e-commerce schema.
Run with `node --expose-gc` on an Intel i7-14700 @ ~5.15 GHz, Node 25.9.0.

| Library | Avg (µs/iter) | Allocation (bytes) |
|---------|:-------------:|:------------------:|
| ajv | ~2.1 | ~1,080 |
| **boer** | **~6.1** | **~161** |
| zod | ~19 | ~8,500–63,000 |

boer is ~3x slower than Ajv and ~3x faster than Zod. I've run several types of benchmarks, and the results are pretty consistent. boer is somewhere between 3-4 times slower than ajv in terms of raw throughput and generally allocates equal to or less memory than ajv.

---

### Schema compilation (build time)

The real win for boer is at compile time and cold-start time.

| Schema | Ajv compile | Ajv output | boer compile | boer output |
|--------|:-----------:|:----------:|:------------:|:-----------:|
| [AWS CloudFormation](https://raw.githubusercontent.com/awslabs/goformation/master/schema/cloudformation.schema.json) | 6,389 ms | 36,452 KB JS | 103 ms | 259 KB binary |
| [Gitlab CI](https://gitlab.com/gitlab-org/gitlab/-/blob/master/app/assets/javascripts/editor/schema/ci.json) | 113 ms | 753 KB JS | 20 ms | 12 KB binary |

This basically illustrates the "trade-off" idea of building boer: we trade slower validation performance for better schema compression, faster boots, and smaller memory footprint.

---

### When to use what

**Use Ajv** when raw validation throughput is the only constraint and you're in an
environment that allows `eval` / `new Function`. For hot paths in long-lived servers
with stable schemas, pre-compiled Ajv is unbeatable.

**Use boer** when:

- You're in an environment where `eval` is disallowed (CSP, Cloudflare Workers, sandboxed runtimes)
- Cold-start time matters (Lambda, edge functions, short-lived containers)
- Schema compilation is part of your CI pipeline and the output needs to stay small
- You're working with very large schemas (CloudFormation, OpenAPI specs)
- You want zero-allocation validation with deferred error reporting via `diagnose()`

## Packages

boer is a monorepo with these packages:

| Package | What it does |
|---------|-------------|
| `boer` | Main entry point, re-exports everything |
| `@boer/core` | Bit constants, type definitions, shared utilities |
| `@boer/builder` | DSL allocators (object, array, union, etc.) |
| `@boer/validate` | Catalog and validation engine |
| `@boer/schema` | JSON Schema parser (all drafts) |
| `@boer/compiler` | Compiles parsed JSON Schema AST into the catalog |
| `@boer/diagnose` | Error reporting with paths |
| `@boer/inspect` | Debug printing and binary serialization |

## Fun fact

The original idea behind boer was: what if JavaScript types were just numbers, and you could combine them with bitwise OR? This actually works for primitives, since each type is a single bit:

```ts
import { object, STRING, NUMBER, NULL } from 'boer';

const Person = object({
  firstName: STRING | NULL,   // nullable string
  age: NUMBER | NULL,         // nullable number
  id: STRING | NUMBER         // string or number union
});
```

However, this breaks down for complex types, as the primitive types collide with the complex pointer bitspace. So in general, don't use it, use the builtin DSL allocators... It's just a toy feature and the original idea of the library, which is why it still exists as exports...

## License

Apache-2.0
