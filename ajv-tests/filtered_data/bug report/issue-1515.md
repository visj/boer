# [1515] Error validating with nested oneOf/anyOf/allOf

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
7.2.3 (latest)

**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv/api.md/api.md#options -->

```javascript
const Ajv = require("ajv/dist/2019").default;
const ajvFormats = require('ajv-formats').default;
const ajv = new Ajv({
    allErrors: true,
    validateFormats: true
});
ajvFormats(ajv);
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "$schema": "https://json-schema.org/draft/2019-09/schema",
    "$id": "https://test.com/test.json",
    "type": "object",
    "anyOf": [
        {
            "required": [ "flag" ],
            "properties": {
                "type": {
                    "const": "FOO"
                },
                "flag": {
                    "type": "boolean"
                }
            }
        },
        {
            "properties": {
                "type": {
                    "enum": [ "BAR", "BAZ" ]
                }
            },
            "anyOf": [
                {
                    "required": [ "name" ],
                    "properties": {
                        "name": {
                            "type": "string"
                        }
                    }
                },
                {
                    "required": [ "value" ],
                    "properties": {
                        "value": {
                            "type": "number"
                        }
                    }
                }
            ]
        }
    ]
}
```

**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
    "type": "BAR",
    "value": 500
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
https://runkit.com/mweber03/605d4480645b6e001a445577

```javascript
var validate = ajv.compile(schema);
console.log(validate(data));
```

**Validation result, data AFTER validation, error messages**

```
TypeError: Cannot convert undefined or null to object
    at Function.assign ()
    at validate539 (eval at compileSchema (node_modules\ajv\dist\c ompile\index.js:88:30), :3:4381)
```

**What results did you expect?**
A successful validation (It worked with draft04 and v5.2.0)

**Are you going to resolve the issue?**