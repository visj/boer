# [1076] Confusing use of $ref, $id and $schema, perhaps a bug or misunderstanding.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.10.0

**Ajv options object**

```javascript
{ allErrors: true }

```

**Your code**

```javascript
// using an AJV object like this
const AJV = new Validator({ allErrors: true })

// this causes "can't resolve reference" error
const defSchema = {
    $id: "http://example.com/v1", // <- full url
    $schema: "http://json-schema.org/draft-07/schema#",
    definitions: {
        EXAMPLE: {
            $id: "example",
            type: "string"
        }
    }
}
AJV.addSchema(defSchema)
const validationSchema = {
    $schema: "http://example.com/v1",
    $ref: "example"
}
const validator = AJV.compile(validationSchema)
const data = 123
const valid = validator(data)

// this also causes reference error
const defSchema = {
    $id: "v1/", // <- only trailing slash
    $schema: "http://json-schema.org/draft-07/schema#",
    definitions: {
        EXAMPLE: {
            $id: "example",
            type: "string"
        }
    }
}
AJV.addSchema(defSchema)
const validationSchema = {
    $schema: "v1/",
    $ref: "example"
}
const validator = AJV.compile(validationSchema)
const data = 123
const valid = validator(data)

// this validates as expected, example/type should be string
const AJV = new Validator({ allErrors: true })
const defSchema = {
    $id: "v1", // however, omitting this will also cause a reference error
    $schema: "http://json-schema.org/draft-07/schema#",
    definitions: {
        EXAMPLE: {
            $id: "example",
            type: "string"
        }
    }
}
AJV.addSchema(defSchema)
const validationSchema = {
    $schema: "v1", // omitting this while leaving the $id for the defSchema as v1 will also validate as expected
    $ref: "example"
}
const validator = AJV.compile(validationSchema)
const data = 123
const valid = validator(data)
```

**What results did you expect?**
I would expect that for whatever `$id` value is provided for a schema that is used in the ajv object, that when that schema is referenced by another schema by that `$id` value in the `$schema` property, the `$ref` values should be validated against the `$id` values of the definitions in the referenced schema.

**Are you going to resolve the issue?**
Only if requested to.