# [2172] Conditional type + union + generics not allowed

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.11

**Ajv options object**
Using these:
```
import ajvErrors from 'ajv-errors'
import addFormats from 'ajv-formats'
import betterAjvErrors from 'better-ajv-errors'
```

default options.

**Problem**

I want to have a type definition like 

```typescript
type Test2<T> = T extends undefined ? undefined : JSONSchemaType<T>
```

However, this fails for types where `T` is a union type. Here is a complete example highlighting the problem:

```typescript
import { JSONSchemaType } from 'ajv'

type ExampleStringBody = {
  foo: string
}

type ExampleNumberBody = {
  bar: number
}

type ExampleBody = ExampleStringBody | ExampleNumberBody

const exampleNumberBodySchema: JSONSchemaType<ExampleNumberBody> = {
  type: 'object',
  required: ['bar'],
  properties: {
    bar: {
      type: 'number',
    },
  },
}

const exampleStringBodySchema: JSONSchemaType<ExampleStringBody> = {
  type: 'object',
  required: ['foo'],
  properties: {
    foo: {
      type: 'string',
    },
  },
}

const exampleBodySchema: JSONSchemaType<ExampleBody> = {
  type: 'object',
  oneOf: [exampleNumberBodySchema, exampleStringBodySchema],
}

// This one does not work. The rest of the example below this one work.
// ✕ | ✓ conditional type | ✓ union | ✓ generic
type Type1<T> = T extends undefined ? undefined : JSONSchemaType<T>
const a: Type1<ExampleBody> = exampleBodySchema

// ✓ | ✓ conditional type | ✕ union | ✓ generic
const b: Type1<ExampleStringBody> = exampleStringBodySchema

// ✓ | ✕ conditional type | ✓ union | ✓ generic
type Type2<T> = JSONSchemaType<T>
const c: Type2<ExampleBody> = exampleBodySchema

// ✓ | ✓ conditional type | ✓ union | ✕ generic
type Test1 = ExampleBody extends undefined
  ? undefined
  : JSONSchemaType<ExampleBody>
const d: Test1 = exampleBodySchema

// ✓ | ✕ conditional type | ✕ union | ✓ generic
const e: Type2<ExampleBody> = exampleBodySchema

// ✓ | ✓ conditional type | ✕ union | ✕ generic
type Type3 = ExampleStringBody extends undefined
  ? undefined
  : JSONSchemaType<ExampleStringBody>
const f: Type3 = exampleStringBodySchema
```

For whatever reason, the specific combination of generics + union + generics is not accepted by typescript. The error I get out is:

```
const a: UncheckedJSONSchemaType<ExampleNumberBody, false> | UncheckedJSONSchemaType<ExampleStringBody, false>

Type '{ oneOf: readonly UncheckedJSONSchemaType<ExampleBody, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<...> | undefined; definitions?: Record<...> | undefined; }' is not assignable to type 'UncheckedJSONSchemaType<ExampleNumberBody, false> | UncheckedJSONSchemaType<ExampleStringBody, false>'.
  Type '{ oneOf: readonly UncheckedJSONSchemaType<ExampleBody, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<...> | undefined; definitions?: Record<...> | undefined; }' is not assignable to type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }'.
    Property 'type' is missing in type '{ oneOf: readonly UncheckedJSONSchemaType<ExampleBody, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<...> | undefined; definitions?: Record<...> | undefined; }' but required in type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; }'.ts(2322)
json-schema.d.ts(57, 5): 'type' is declared here.
```

I've ready all of the threads on union types in here that I can find. 