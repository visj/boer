# [1350] unevaluatedProperties in subschema does not work correctly with allOf

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
7.0.0-rc2
**Ajv options object**

use the 2019 version of the validator

```javascript
var ajv2019 = require('ajv/dist/2019').default;
var ajv = new ajv2019();
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "properties": {
    "rootObject": {
      "type": "object",
      "allOf": [
        {
          "$ref": "#/definitions/subLevel"
        },
        {
          "properties": {
            "topLevelProp": { "type": "string" }
          },
          "required": ["topLevelProp"]
        }
      ],
      "unevaluatedProperties": false,
    }
  },
  "definitions": {
    "subLevel": {
      "type": "object",
      "properties": {
        "subLevelProp": { "type": "string" },
      },
      "required": ["subLevelProp"],
      "unevaluatedProperties": false,
    },
  },
}
```

**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
  "rootObject": {
    "subLevelProp": "a",
    "topLevelProp": "a",
  }
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

link to code sample: https://runkit.com/bourbongit/5fd73f6aa58c7a001a4b01f1

```javascript
var ajv2019 = require('ajv/dist/2019').default;
var ajv = new ajv2019();
let validate = ajv.compile(schema);
console.log(validate(data));
console.log(validate.errors)
```

**Validation result, data AFTER validation, error messages**

```
strict mode: missing type "object" for keyword "properties" at "#" (strictTypes)
false
[
  {
    keyword: 'unevaluatedProperties',
    dataPath: '/rootObject',
    schemaPath: '#/definitions/subLevel/unevaluatedProperties',
    params: { unevaluatedProperty: 'topLevelProp' },
    message: 'should NOT have unevaluated properties'
  }
]
```

**What results did you expect?**
The data should evaluate successfully against the schema. Indeed the unevaluatedProperties in the scope of a subLevel should not consider properties defined by its enclosing schema as "unevaluated" because they are evaluated by the parent schema.

  "rootObject": {
    "subLevelProp": "a", --> evaluated by the sub-schema "subLevel"
    "topLevelProp": "a", --> evaluated by the top-level schema "rootObject"
  }

Otherwise it's simply impossible to have a data matching this schema.
A workaround is to remove the unevaluatedProperties from the subschema subLevel, and it works. However this is a problem in large complex schemas where sub-schemas are used in different places, sometimes as top-level schemas, sometimes as sub-schemas, and we want to enforce unevaluatedProperties to true eveyrwhere.

**Are you going to resolve the issue?**
no