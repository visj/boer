# [1883] assignment of "JSONSchemaType<any>" fails for existing schema type with required properties

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Latest

**Ajv options object**

Does not apply typescript issue

**JSON Schema**

includes reproduction below

**Sample data**

includes sample below

[Playground link](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgKQMoHkByqDGALAUxAEMAVATzALgF84AzKCEOAcmICsA3VgKF5iVqAEWIxiAdWAw8mAK4AbBcQBGC6gF5EcAgA9i4dQH4AXHBUQI64gDtavHBBsBneABMxk6bMXK1BXEISMzQsQKIyIQAeUXEpGXklVXUAPjgtBF44bLhBKjMAIggVDgIcGAKAGiycsCYqWGACZzNMnPadfUMCVpqOjryeuAKLKwJbKr7+nJtfZKGYKDkCKfaaKfX13gB6bbhnORwcAgI3Z1yhfDKAawcnVzgrnGv4xL91EIxsK5IKKijbOQ0loPHFvG95uESPxBnBYl4ZAAlAgARzkwCgp3S2j0BjAH3MlmsdnWjhc7k88TwyLRGNOUOInzCP0i-3hVJp6MxbmBiCmg0KxVK5Um7TqEAaMCaLT5006eIJbTlOQFw1GxIKqxy6zW1XamNp3LMAG1WLjuqwALq8La7BjEYAKc6DJ63MkPV0c1Fc05M75BVkEAE2IHY0EI6neuluBlAA)

```ts
import { JSONSchemaType } from 'ajv'

type DataWithNullable = { example?: boolean }
const dataWithNullableSchema: JSONSchemaType<DataWithNullable> = {
    type: "object",
    properties: {
        example: {
            type: "boolean",
            nullable: true
        }
    }
}

// succeeds typecheck
const checkWitNullable: JSONSchemaType<any> = dataWithNullableSchema

type DataWithRequired = { example: boolean }
const dataWithRequiredSchema: JSONSchemaType<DataWithRequired> = {
    type: "object",
    properties: {
        example: {
            type: "boolean"
        }
    },
    required: ['example']
}

// fails typecheck
const checkWithRequired: JSONSchemaType<any> = dataWithRequiredSchema
```

**Validation result, data AFTER validation, error messages**

type error

**What results did you expect?**

I'd expect this code not to fail type validation

**Are you going to resolve the issue?**

not sure how
