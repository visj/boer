# [1488] oneOf of schemas with common properties

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
I'm using the latest version 7.2.1

**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv/api.md/api.md#options -->

```javascript
{}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "definitions": {
    "schema1": {
      "type": "object",
      "properties": {
        "prop1": { "type": "string" },
        "prop2": { "type": "string" }
      },
      "additionalProperties": false
    },
    "schema2": {
      "type": "object",
      "allOf": [
        {
          "$ref": "#/definitions/schema1"
        },
        {
          "properties": {
            "prop3": { "type": "string" },
            "prop4": { "type": "string" }
          }
        }
      ],
      "additionalProperties": false
    }
  },
  "oneOf": [
    { "$ref": "#/definitions/schema1" },
    { "$ref": "#/definitions/schema2" }
  ]
}

```

**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
  "prop1": "string",
  "prop2": "string",
  "prop3": "string",
  "prop4": "string"
}

```

**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
const Ajv = require("ajv").default;
const ajv = new Ajv();

const validate = ajv.compile(schema);
const valid = validate(data);

if (!valid) console.log(validate.errors);

```

https://runkit.com/guerrap/604b35dfbb8bcc001a57abd5

**Validation result, data AFTER validation, error messages**

```
[
  {
    keyword: 'additionalProperties',
    dataPath: '',
    schemaPath: '#/definitions/schema1/additionalProperties',
    params: { additionalProperty: 'prop3' },
    message: 'should NOT have additional properties'
  },
  {
    keyword: 'additionalProperties',
    dataPath: '',
    schemaPath: '#/definitions/schema1/additionalProperties',
    params: { additionalProperty: 'prop3' },
    message: 'should NOT have additional properties'
  },
  {
    keyword: 'oneOf',
    dataPath: '',
    schemaPath: '#/oneOf',
    params: { passingSchemas: null },
    message: 'should match exactly one schema in oneOf'
  }
]
```

**What results did you expect?**

This is more a question than an actual issue because that's probably how JSON schema is supposed to work.
Anyway, I'm trying to define a schema that validates multiple definitions using the `oneOf`, each of which can't have any additional prop. The "problem" is that the schemas have common properties, so I extend the first one and add the additional properties that I need.

Now, since the first schema has `additionalProperties` set to `false`, the example data provided above fails the validation; if I remove the `additionalProperties` in the first schema the validation passes but then something like this is also accepted:

```json
{
  "prop1": "string",
  "prop2": "string",
  "prop5": "string"
}
```
My use case is to have `n` schema definitions, each of which can't have any additional prop, and they can share properties (or extend other schema).

How is this achievable with JSON schema? I'm sure doing something wrong, but I can't figure it out. 