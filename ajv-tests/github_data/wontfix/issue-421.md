# [421] Validating propertyNames defined by a $data reference

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->


## The code is also available on runkit:
- https://runkit.com/sondrele/589c8183c90f930014b5ec14https://runkit.com/sondrele/589c8183c90f930014b5ec14


**What version of Ajv are you using? Does the issue happen if you use the latest version?**
ajv: 4.11.2
ajv-keywords: 1.5.1

**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

```javascript
var Ajv = require('ajv@4.11.2');
ajv = new Ajv({
    v5: true,
    allErrors: true,
    errorDataPath: 'property',
    verbose: true,
    missingRefs: "fail",
    unknownFormats: 'ignore',
    multipleOfPrecision: 12,
    extendRefs: true,
    passContext: true,
    i18n: false
});
require('ajv-keywords@1.5.1/keywords/propertyNames')(ajv); 

```

**JSON Schema (please make it as small as possible to reproduce the issue):**

```json
var schema = {
    "type": "object",
    "properties": {
        "selectedIps": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": [
                    "FOO",
                    "BAR"
                ]
            }
        },
        "dynamicIps": {
            "type": "object",
            "additionalProperties": {
                "type": "object",
                "properties": {
                    "ip": { "format": "ipv4" }
                },
                "required": [ "ip" ]
            },
            "propertyNames": {
                "enum": {
                    "$data": "/selectedIps"
                }
            }
        }
    }
};

```


**Data (please make it as small as posssible to reproduce the issue):**

```json
var invalidData = {
    "selectedIps": [ "FOO" ],
    "dynamicIps": {
        "BOO": { "ip": "0.0.0.0" }
    }
};

```


**Your code (please use `options`, `schema` and `data` as variables):**

```javascript
console.log(ajv.validate(schema, invalidData))

```

<!--
It would help if you post a working code sample in Tonic notebook and include the link here. You can clone this notebook: https://tonicdev.com/esp/ajv-issue.
-->


**Validation result, data AFTER validation, error messages:**

```
true

```

**What results did you expect?**
I expected a validation error, but the result is `true`.

I had expected ajv to validate the properyName `BOO` against the value `["FOO"]`, and end the validation with an error, instead it validates to `true`.

I have provided two additional cases on [runkit](https://runkit.com/sondrele/589c8183c90f930014b5ec14):
* `Case 1 (unexpected)` - the example provided in this issue
* `Case 2 (expected)` - validates `additionalProperties` directly towards the `enum` in the `dynamicIps` schema
* `Case 3 (expected)` - validates `additionalProperties` like in `Case 1`, but also sets the properties as `required` with the same `$data` reference as the `propertyNames`
