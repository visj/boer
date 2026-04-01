# [337] Does not pick up default value if defined in $ref definition

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
4.8.2


**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

```javascript
{
    allErrors: true,
    format: 'full',
    useDefaults: true
}
```


**JSON Schema (please make it as small as possible to reproduce the issue):**

```js
{
    ...
    "properties": {
        "phone": {
            "$ref": "#/definitions/optionalPhone"
        },
       ...
    },
    "definitions": {
        "emptyString": {
            "type": "string",
            "maxLength": 0
        },
        "optionalPhone": {
            "anyOf": [
                { "format": "phone" },
                { "$ref": "#/definitions/emptyString" }
            ],
            "default": ""
        }
    }
}
```
Above will work only if I define `default: ""` within `phone`.

**Data (please make it as small as posssible to reproduce the issue):**

```json
{}
```

<!--
It would help if you post a working code sample in Tonic notebook and include the link here. You can clone this notebook: https://tonicdev.com/esp/ajv-issue.
-->


**Validation result, data AFTER validation, error messages:**
Data after validation: `{}`  
No errors. Just the default value is not set for `phone`.

**What results did you expect?**
`{ phone: "" }`

