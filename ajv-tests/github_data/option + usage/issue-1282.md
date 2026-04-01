# [1282] if/then/else keywords not working as expected

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.12.2


**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv#options -->

```javascript
{ allErrors: true, removeAdditional: 'all', nullable: true }

```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "title": "sendSms",
    "type": "object",
    "properties": {
        "clientIds": {
            "type": "array"
        },
        "smsId": {
            "type": "integer"
        },
        "content": {
            "type": "string"
        },
        "subject": {
            "type": "string"
        },
        "marketing": {
            "type": "boolean"
        }
    },
    "required": ["clientIds", "marketing"],
    "anyOf": [
        { "required": ["smsId"] },
        {
            "if": { "properties": { "marketing": { "const": true } } },
            "then": { "required": ["content", "subject"] },
            "else": { "required": ["content"] }
        }
    ]
}

```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
  "clientIds": [
    12345
  ],
  "content": "test content",
  "marketing": false
}

```

**Validation result, data AFTER validation, error messages**

```
{
    "status": "failed",
    "errors": [
        {
            "path": "",
            "message": "should have required property 'smsId'",
            "params": {
                "missingProperty": "smsId"
            }
        },
        {
            "path": "",
            "message": "should have required property 'content'",
            "params": {
                "missingProperty": "content"
            }
        },
        {
            "path": "",
            "message": "should match \"else\" schema",
            "params": {
                "failingKeyword": "else"
            }
        },
        {
            "path": "",
            "message": "should match some schema in anyOf",
            "params": {}
        }
    ]
}

```

**What results did you expect?**

This data should be validated with success, as following this example: https://www.jsonschemavalidator.net/s/eydcldvd
I have no idea why jsonschemavalidator validates it but AJV doesn't.