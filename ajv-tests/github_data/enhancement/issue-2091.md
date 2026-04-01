# [2091] Natively make ajv validators typeguards in TS (integrate with `json-schema-to-ts`)

**What version of Ajv you are you using?**
NA

**What problem do you want to solve?**

In TS, it would be neat to make `ajv.validate` and `ajv.compile` outputs typeguards.

I maintain [`json-schema-to-ts`](https://github.com/ThomasAribart/json-schema-to-ts) which would allow such feature, as long as the schema is defined with the `as const` statement. The lib is heavily tested against `ajv`, and there are even examples on [how to integrate with `ajv`](https://github.com/ThomasAribart/json-schema-to-ts#typeguards).

This is something that is frequently done in many projects, and it would be cool to have this feature natively in the lib.

**What do you think is the correct solution to problem?**

Some schemas (for instance, those imported from `json` files), will NOT be defined with the `as const` statement. Besides, `json-schema-to-ts` has impacts on IDE performances (it comes with some deeply nested type computations), and `FromSchema` can accept configuration options such as deserialization patterns.

So I think the best solution is to make such feature opt-in, but I'm not sure exactly how. Maybe with a type overload:

```typescript
import Ajv, { TypechargedAjv } from 'ajv'

const ajv = new Ajv() as TypechargedAjv<SomeFromSchemaOptions>

const mySchema = { ... } as const

if (ajv.validate(mySchema, someData)) {
   ... // someData is correctly typed
}
```

**Will you be able to implement it?**

Definitely yes.

Note: There are some other solutions out there, but I think `json-schema-to-ts` is the best for this need. Some links if you want to check them:
- https://www.npmjs.com/package/as-typed (less maintained, less downlads and less features)
- https://www.npmjs.com/package/@sinclair/typebox (different approach, as it uses a different syntax, so less directly integrable with `ajv`)
