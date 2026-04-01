# [1416] NOT SUPPORTED: option format. `validateFormats: false` can be used instead

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
    "ajv": "7.0.3",
    "ajv-formats": "1.5.1",

**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv/api.md/api.md#options -->

```javascript
{
    allErrors: true,
    strict: false,
    format: 'full',
    validateFormats: false
}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "data": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": false,
                "properties": {
                    "cacheValue": {
                        "type": "object"
                    },
                    "cacheType": {
                        "type": "string"
                    },
                    "cacheKey": {
                        "type": "string"
                    }
                },
                "required": [
                    "cacheValue",
                    "cacheType",
                    "cacheKey"
                ]    
            }
        }
    },
    "required": [
        "data"
    ]    
}   
```

**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
    "data": [{
        "cacheValue": {
            "carrierId": "0000A",
            "carrierServiceId": "0000A",
            "carrierServiceName": "Fedex"
        },
        "cacheType": "CARRIER_SVC",
        "cacheKey": "0000A"
    }]
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
const Ajv = require('ajv').default;
const AjvFormats = require('ajv-formats');
const schema = require('../schema.json');

const validator = new Ajv({
    allErrors: true,
    strict: false,
    format: 'full',
    validateFormats: false,
});
AjvFormats(validator, ['date', 'time', 'date-time']);

function validateAgainstSchema(payload) {
    const validate = validator.compile(schema);
    const valid = validate(payload);
    if (!valid) {
        const errorData = { validationErrors: [] };

        validate.errors.forEach(e => {
            // Expanded validation error logging here
            const msg = `Message: ${e.message}, Schema Rule: ${e.schemaPath}`;
            errorData.validationErrors.push(msg);
            console.error(`Schema Validation Error:  ${msg}`);
        });
        throw new Error('Validation Errors Detected', errorData);
    }
}
```

**Validation result, data AFTER validation, error messages**
Validations work fine, but we noticed the following warning message on logs and it remains even after validateFormats is explicitly added in options object, set to false
```
NOT SUPPORTED: option format. `validateFormats: false` can be used instead.
```

**What results did you expect?**
No warning message
