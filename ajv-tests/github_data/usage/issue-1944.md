# [1944] unevaluatedProperties does not consider nested property as evaluated

Based on my understanding of the `unevaluatedProperties` keyword, this validation should pass without errors. 

Am I missing something? If so, is there a workaround?

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.11.10

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "object",
  "properties": {
    "attributes": {
      "type": "object",
      "properties": {
        "type": {
          "enum": ["a", "b"]
        }
      }
    }
  },
  "allOf": [
    {
      "type": "object",
      "properties": {
        "attributes": {
          "type": "object",
          "properties": {
            "foo": {
              "type": "string"
            }
          },
          "unevaluatedProperties": false
        }
      },
      "additionalProperties": false
    } 
  ]
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "attributes": {
    "type": "a",
  }
} 
```

**Your code**

```ts
const ajv = new Ajv();
const validate = ajv.compile({
    type: 'object',
    properties: {
        attributes: {
            type: 'object',
            properties: {
                type: {
                    enum: ['a', 'b'],
                },
            },
        },
    },
    allOf: [
        {
            type: 'object',
            properties: {
                attributes: {
                    type: 'object',
                    properties: {
                        foo: {
                            type: 'string',
                        },
                    },
                    unevaluatedProperties: false,
                },
            },
            additionalProperties: false,
        },
    ],
});

validate({
    attributes: {
        type: 'a',
    },
});

expect(validate.errors).toBeNull();
```

**Validation result, data AFTER validation, error messages**

```ts
[{
    instancePath: '/attributes',
    keyword: 'unevaluatedProperties',
    message: 'must NOT have unevaluated properties',
    params: {unevaluatedProperty: 'type'},
    schemaPath: '#/allOf/0/properties/attributes/unevaluatedProperties',
}];
```

**What results did you expect?**
No errors.

**Are you going to resolve the issue?**
Maybe.
