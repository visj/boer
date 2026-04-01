# [1927] { not : {required[] } } Behaving Incorrectly

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.10.0

**Ajv options object**
```javascript
{
    allowUnionTypes: true,
    schemas: { mapPostSchema },
    logger: {
        log: console.log.bind(console),
        warn: function warn() {
            console.warn.apply(console);
        },
        error: function error() {
            console.error.apply(console);
        },
    }
}
```

**JSON Schema**
```javascript
{
    type: "object",
    properties: {
        A: {
            type: "integer",
            minimum: 1,
        },
        B: {},
        C: {},
        D: {},
    },
    allOf: [
        {
            if: {
                properties: {
                    A: {
                        type: "integer",
                        minimum: 1,
                    },
                },
                required: ["A"],
            },
            then: {
                allOf: [
                    { not: { required: ["C"] } },
                    { not: { required: ["D"] } },
                ],
            },
        },
    ],
    additionalProperties: false,
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "chapter": 2
}
```

**Your code**
```javascript
const validateMapPatch = ajv.compile(mapPatchSchema);
const valid = validateMapPatch(data)
```

**Validation result, data AFTER validation, error messages**
```
valid = false

Error:
  {
    instancePath: '',
    schemaPath: '#/allOf/0/then/allOf/1/not',
    keyword: 'not',
    params: {},
    message: 'must NOT be valid'
  }
```

**What results did you expect?**
I expected valid to equal true. I also tried using param: false instead of not: { required: ["param"]} but both give errors. Both methods were valid json schema according to https://www.jsonschemavalidator.net/s/jNIPMtGg , so the issue must be with AJV. I may have configured things incorrectly, but after a day of reading the documentation I decided to post this.
