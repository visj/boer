# [2398] Validate and infer JSON Schema validated data type: introducing type providers

**What version of Ajv you are you using?**
8

**What problem do you want to solve?**
Using `ajv` to validate and infer JSON Schema validated data type at the same time. Eg:

```ts
import Ajv from 'ajv'

const ajv = new Ajv()

const schema = {
  type: 'object',
  properties: {
    foo: { type: 'integer' },
    bar: { type: 'string' }
  },
  required: ['foo'],
  additionalProperties: false
} as const
const validate = ajv.compile(schema)
let data: unknown = { foo: 6 }

if (validate(data)) {
  // data type inferred from schema
  console.log('Validation ok', data)
} else {
  // validate is the usual AJV validate function
  console.log('Validation ko', validate.errors)
}
```

The point here is inferring schema types (with `json-schema-to-ts`) instead of separately providing them.

**What do you think is the correct solution to problem?**

There are several possible solutions but, as far as I know, [json-schema-to-ts](https://github.com/ThomasAribart/json-schema-to-ts) is the only existing library currently being able to infer TS types from a JSON schema.

In order not to bind `ajv` with `json-schema-to-ts` (as a npm dependency), I tried to replicate the **type provider** approach already taken in other libraries like [Fastify](https://fastify.dev/docs/latest/Reference/Type-Providers/).

I published a `@toomuchdesign/ajv-type-provider-json-schema-to-ts` package which is supposed to abstract the necessary bindings between `ajv` and `json-schema-to-ts`.

This is an example of the current api. Happy to review it based on your feedback:

```ts
import Ajv from 'ajv'
import { enhanceCompileWithTypeInference } from '@toomuchdesign/ajv-type-provider-json-schema-to-ts'

const ajv = new Ajv()
const compile = enhanceCompileWithTypeInference(ajv.compile.bind(ajv))

const schema = {
  type: 'object',
  properties: {
    foo: { type: 'integer' },
    bar: { type: 'string' }
  },
  required: ['foo'],
  additionalProperties: false
} as const

const validate = compile(schema)
let data: unknown = { foo: 6 }

if (validate(data)) {
  // data type inferred from schema
  console.log('Validation ok', data)
} else {
  // validate is the usual AJV validate function
  console.log('Validation ko', validate.errors)
}
```

If `ajv` maintainers decided to pick such approach, the type provider could be officially moved under `ajv` umbrella as an official extension.

`ajv` class might even expose a `.withTypeProvider<TypeProvider>()` method returning the class instance itself which does nothing but providing a type hook:

```ts
const ajv = new Ajv()
const typedAjv = ajv.withTypeProvider<JsonSchemaToTsProvider>()

// Use typedAjv as usual
```

Related issues:

- https://github.com/ajv-validator/ajv/issues/1902
- https://github.com/ajv-validator/ajv/issues/2339
- https://github.com/ajv-validator/ajv/issues/2360
- https://github.com/ajv-validator/ajv/issues/1956
- https://github.com/ajv-validator/ajv/issues/2091
- https://github.com/ajv-validator/ajv/issues/1792

**Will you be able to implement it?**

Yes.

- Source code: https://github.com/toomuchdesign/ajv-type-provider-json-schema-to-ts
- NPM package: https://www.npmjs.com/package/@toomuchdesign/ajv-type-provider-json-schema-to-ts