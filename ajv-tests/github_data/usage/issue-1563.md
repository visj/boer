# [1563] [question] Issue validating and schema with `oneOf`

### Brief description
Thanks for this library, probably I am not configuring some options but we are using this [OpenAPI example](https://swagger.io/docs/specification/data-models/oneof-anyof-allof-not/#oneof) We are expecting to not receive an error as the example in the Official docs is a valid object but we are receiving an error in the validation 🤔

I provided the version and a basic example that simulates the issue.

---

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

v8.1.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const options = {
  schemas: [
    {
      $id: 'defs.json',
      definitions: {
        components: {
          schemas: {
            Dog: {
              type: 'object',
              properties: {
                bark: {
                  type: 'boolean',
                },
                breed: {
                  type: 'string',
                  enum: [
                    'Dingo',
                    'Husky',
                    'Retriever',
                    'Shepherd',
                  ],
                },
              },
            },
            Cat: {
              type: 'object',
              properties: {
                hunts: {
                  type: 'boolean',
                },
                age: {
                  type: 'integer',
                },
              },
            },
          },
        },
      },
    },
  ],
};
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "oneOf":
  [{ "$ref": "defs.json#/definitions/components/schemas/Cat" },
    { "$ref": "defs.json#/definitions/components/schemas/Dog" }]
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "bark": true,
  "breed": "Dingo"
}
```

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
const Ajv = require('ajv').default;

const options = {
  schemas: [
    {
      $id: 'defs.json',
      definitions: {
        components: {
          schemas: {
            Dog: {
              type: 'object',
              properties: {
                bark: {
                  type: 'boolean',
                },
                breed: {
                  type: 'string',
                  enum: [
                    'Dingo',
                    'Husky',
                    'Retriever',
                    'Shepherd',
                  ],
                },
              },
            },
            Cat: {
              type: 'object',
              properties: {
                hunts: {
                  type: 'boolean',
                },
                age: {
                  type: 'integer',
                },
              },
            },
          },
        },
      },
    },
  ],
};

const ajv = new Ajv(options);

const validateSchema = ajv.compile({
  oneOf:
  [{ $ref: 'defs.json#/definitions/components/schemas/Cat' },
    { $ref: 'defs.json#/definitions/components/schemas/Dog' }],
});
const valid = validateSchema({
  bark: true,
  breed: 'Dingo',
});
if (!valid) return console.log(validateSchema.errors);
console.log('No error');
```

**Validation result, data AFTER validation, error messages**

```
[
  {
    "instancePath": "",
    "schemaPath": "#/oneOf",
    "keyword": "oneOf",
    "params": {
      "passingSchemas": [
        0,
        1
      ]
    },
    "message": "must match exactly one schema in oneOf"
  }
]
```

**What results did you expect?**

We are using this [OpenAPI example](https://swagger.io/docs/specification/data-models/oneof-anyof-allof-not/#oneof) of `oneOf` key. We expected to not receive an error as the example in the Official docs is a valid object.


