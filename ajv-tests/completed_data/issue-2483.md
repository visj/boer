# [2483] Unexpected behaviour of unevaluatedProperties when used with dependentSchemas

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

Code sandbox: https://codesandbox.io/s/ajv-playground-forked-nz924l?file=/src/index.js

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Latest 8.17.1

**Ajv options object**

Empty (no options)

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "link": {
      "type": "boolean"
    }
  },
  "required": ["name"],
  "unevaluatedProperties": false,
  "dependentSchemas": {
    "link": {
      "if": {
        "properties": {
          "link": {
            "const": true
          }
        }
      },
      "then": {
        "properties": {
          "originalId": {
            "type": "string"
          }
        },
        "required": ["originalId"]
      }
    }
  }
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "name": "test"
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
const Ajv2020 = require("ajv/dist/2020");
const ajv = new Ajv2020();

const schema = require("./schema.json");
const validate = ajv.compile(schema);

const valid = validate({
  name: "test"
});
```

**Validation result, data AFTER validation, error messages**

```json
{
  "instancePath": "",
  "schemaPath": "#/unevaluatedProperties",
  "keyword": "unevaluatedProperties",
  "params": {
    "unevaluatedProperty": "name"
  },
  "message": "must NOT have unevaluated properties"
}
```

**What results did you expect?**

If I understand the JSON Schema specification around `unevaluatedProperties` and sub-schemas applied conditionally, the validation should pass with no errors given that `name` is defined in `properties` adjacent to `unevaluatedProperties` and it is present in the data instance.

Interestingly, the same example passes validation in https://www.jsonschemavalidator.net

**Are you going to resolve the issue?**

Looking for clarification/analysis from maintainers or those who are well-versed in latest JSON Schema specifications.