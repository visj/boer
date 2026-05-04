# boer

boer is a JSON Schema compliant type validation library for JavaScript.

## Why

So, first of all, ajv is an amazing library. For many cases, just use ajv; it's widely supported, and much faster than boer in raw throughput. However, ajv has some drawbacks, notably:

1. It relies on `eval / new Function`, which in many environments is disallowed for security reasons. It offers standalone code, but compiling many schemas become tedious, and they swell in size.
2. ajv compiler is very slow. For long lived applications, this doesn't matter, but parsing large schemas means cold-boot starts take a hit. For short-lived applications, it's even worse. If you're spinning up small lambda functions that just live a few minutes, the overhead of parsing schemas at boot, or shipping large standalone javascript files, starts adding up.
3. Re-compiling ajv schemas make CI tools quite slow.
4. ajv supports draft 2020, but the default is still draft 7.

boer is basically a mix between Zod and Ajv. Some of it's main features are:

1. Full support for drafts 4 through 2020 of JSON Schema, including the more advanced concepts like $dynanchor, $dynref and unevaluated items/properties.
2. Fast performance and low memory allocation. boer is a runtime, not a compiler, so it will never be as fast as libraries like ajv, but it aims to narrow the gap.
3. A generic AST allowing boer to be extended to Open API spec etc.
4. A convenient, Typescript friendly DSL like Zod, with support for `Infer`.
5. It compiles schemas to binaries. For instance, the CloudFormation Schema generates 35.6 MB minified JavaScript with ajv standalone, taking 8.6 seconds to compile. boer parses it to a binary in 166 ms, and outputs a 390 kb binary file that you can instantly load into memory.

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

boer is built on bitwise operators and an internal heap of an `Uint32Array` slab storage. To shave memory, it encodes primitives including validators into a single 32 bit number. Complex types are stored on the heap, and for those, the allocators return a raw pointer into the heap.

Similar to how V8 distinguishes between primitives/objects by using one bit toggle, boer uses the lowest bits to represent complex types, null and undefined. Complex types use the upper bitspace as a pointer into the heap, primitive types use that space to inline validators, such as minLength, maxLength for common use cases.

Internally, every string is converted to a number through an auto-increment ID. Objects are stored on the slab heap, like this:

`[keyId, typeId, keyId, typeId`

The typeId can either be a raw primitive, or a complex pointer to somewhere else on the heap.

Implementing the full JSON Schema was not trivial, especially figuring out how unevaluated items and $dynref/$dynanchor should work, without bloating performance. The purpose for writing this library was to understand better how to leverage AI tools efficiently, so I needed some appropriately difficult thing to implement.

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

## Notes
Every type is a plain JavaScript number. Primitives are bitsets, complex types are pointers into internal memory. The original reason/idea for building this library was basically: could I just encode types in JavaScript, and use bitwise or `|` to represent types? It felt like a cool thing, and then I just kept building features on top of that idea. Now, I wouldn't really recommend anyone using that, because it only works for primitives. If you try to or a complex type, that will break... So I didn't ship it as part of public API, it's more a toy feature...

```ts
import { object, STRING, NUMBER, NULL } from 'boer';

const Person = object({
  firstName: STRING | NULL,
  age: NUMBER | NULL,
  id: STRING | NUMBER
});

// STRING | NUMBER gives you a union of string and number
// STRING | NULL gives you a nullable string
```

## License

Apache-2.0
