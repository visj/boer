# uvd

A JSON Schema compliant type validation library for JavaScript. Define schemas with a Zod-like DSL or parse JSON Schema directly. Every type definition compiles down to raw integers on a managed heap, keeping allocation pressure low during validation.

Still early alpha, but it passes 100% of the JSON Schema Test Suite.

```
npm install uvd
```

## Why

Libraries like Ajv get great throughput by compiling schemas into JavaScript functions, but that compilation step has a cost. For a single large schema it can take milliseconds. If you have many schemas, or you're in a cloud/edge environment where containers and isolates are constantly starting and stopping, that startup tax adds up. Shipping pre-compiled Ajv output avoids the compile step, but the generated JavaScript files can get large.

uvd takes a different approach. Instead of generating code, it compiles schemas into compact binary data on a managed heap (typed arrays). Validation interprets that data directly. It won't match Ajv on raw CPU throughput, but it starts up fast, keeps a small memory footprint, and the compiled schemas can be serialized to a binary format that loads with near-zero overhead.

The intended sweet spot is environments where memory is constrained and cold starts matter: serverless functions, edge workers, short-lived containers.

## Quick example

```ts
import { object, string, number, array, union, literal, optional, validate, diagnose } from 'uvd';

const Payment = object({
  id: string(),
  userId: string() | number(),
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

Every type is a plain JavaScript number. Primitives are bitsets, complex types are pointers into internal memory. You can compose them with bitwise OR:

```ts
import { STRING, NUMBER, NULL } from 'uvd';

// STRING | NUMBER gives you a union of string and number
// STRING | NULL gives you a nullable string
```

## What it supports

**Primitives:** `string`, `number`, `boolean`, `null`, `undefined`, `any`, `never`

**Structural types:** `object`, `array`, `tuple`, `record`

**Composition:** `union` (anyOf), `exclusive` (oneOf), `intersect` (allOf), `not`, `when` (if/then/else)

**Validators:** `minLength`, `maxLength`, `pattern`, `format`, `minimum`, `maximum`, `exclusiveMinimum`, `exclusiveMaximum`, `multipleOf`, `minItems`, `maxItems`, `uniqueItems`, `contains`, `minProperties`, `maxProperties`, `patternProperties`, `additionalProperties`, `dependentRequired`

**Other:** `literal`, `refine` (custom validator functions), discriminated unions, `nullable`, `optional`

## JSON Schema

uvd can parse and validate against JSON Schema directly, supporting Draft 4, 6, 7, 2019-09 and 2020-12. This includes `$ref`, `$defs`, `$anchor`, `$dynamicRef`, `unevaluatedItems`, `unevaluatedProperties`, and the rest of the spec.

```ts
import { catalog } from '@uvd/validate';
import { parseJSONSchema } from '@uvd/schema';
import { compile } from '@uvd/compiler';

const cat = catalog();
const ast = parseJSONSchema(mySchema);
const typedef = compile(cat, ast);

cat.validate(data, typedef);
```

## How it works

Every schema you define gets compiled into blocks of memory on an internal heap. The heap is a set of `Uint32Array` and `Float64Array` buffers. A "type" is just a 32-bit unsigned integer:

- Bits 0-2 are flags: complex, nullable, optional
- For simple types, bits 3-7 encode the primitive kind directly
- For complex types, the upper bits are an index into a vtable that points to the type's storage on the slab

Validation walks these packed integers instead of traversing object graphs. The tradeoff is that schema definition does allocate (onto the internal heap), but that's a one-time cost.

## Binary serialization

uvd can serialize a compiled catalog to a binary format and load it back. This is the main mechanism for fast cold starts: parse and compile your schemas at build time, ship the binary, and load it at runtime without any schema processing.

```ts
import { dump, load } from '@uvd/inspect';

// At build time
const buffer = dump(catalog);

// At runtime, no parsing or compilation needed
const restored = load(buffer);
```

## Packages

uvd is a monorepo with these packages:

| Package | What it does |
|---------|-------------|
| `uvd` | Main entry point, re-exports everything |
| `@uvd/core` | Bit constants, type definitions, shared utilities |
| `@uvd/builder` | DSL allocators (object, array, union, etc.) |
| `@uvd/validate` | Catalog and validation engine |
| `@uvd/schema` | JSON Schema parser (all drafts) |
| `@uvd/compiler` | Compiles parsed JSON Schema AST into the catalog |
| `@uvd/diagnose` | Error reporting with paths |
| `@uvd/conform` | Data coercion and transformation |
| `@uvd/inspect` | Debug printing and binary serialization |

## License

Apache-2.0
