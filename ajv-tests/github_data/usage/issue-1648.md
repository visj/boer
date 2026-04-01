# [1648] oneOf not validating between type string and type null

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.6.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const ajv = new Ajv({ allErrors: true, coerceTypes: true, useDefaults: true, verbose: true })
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "object",
  "properties": {
    "a": {
      "oneOf": [
        { "type": "string" },
        { "type": "null" }
      ]
    }
  },
  "required": ["a"]
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{ "a": null }
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
const Ajv = require('ajv')

const ajv = new Ajv({ allErrors: true, coerceTypes: true, useDefaults: true, verbose: true })

const schema = {
  "type": "object",
  "properties": {
    "a": {
      "oneOf": [
        { "type": "string" },
        { "type": "null" }
      ]
    }
  },
  "required": ["a"]
}
ajv.addSchema(schema, 'a')

const validateSchema = ajv.getSchema('a')

if (validateSchema({ "a": null })) {
  console.info('valid')
} else {
  console.error(JSON.stringify(validateSchema.errors, null, 4))
  console.info('invalid')
}

```

**Validation result, data AFTER validation, error messages**

```
[
    {
        "instancePath": "/a",
        "schemaPath": "#/properties/a/oneOf",
        "keyword": "oneOf",
        "params": {
            "passingSchemas": [
                0,
                1
            ]
        },
        "message": "must match exactly one schema in oneOf",
        "schema": [
            {
                "type": "string"
            },
            {
                "type": "null"
            }
        ],
        "parentSchema": {
            "oneOf": [
                {
                    "type": "string"
                },
                {
                    "type": "null"
                }
            ]
        },
        "data": null
    }
]
invalid

```

**What results did you expect?**
valid

**Are you going to resolve the issue?**
