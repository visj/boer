# [1643] invalid json is recognized as valid

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

0.8.6

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{ strict: "log" }
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->
sorry for the size, i shrinked it already
```json
{
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "urn:OCPP:1.6:2019:12:MeterValuesRequest",
    "title": "MeterValuesRequest",
    "type": "object",
    "properties": {
        "connectorId": {
            "type": "integer"
        },
        "transactionId": {
            "type": "integer"
        },
        "meterValue": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "timestamp": {
                        "type": "string",
                        "format": "date-time"
                    },
                    "sampledValue": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "value": {
                                    "type": "string"
                                },
                                "context": {
                                    "type": "string",
                                    "additionalProperties": false,
                                    "enum": [
                                        "foo"
                                    ]
                                },
                                "format": {
                                    "type": "string",
                                    "additionalProperties": false,
                                    "enum": [
                                        "foo"
                                    ]
                                },
                                "measurand": {
                                    "type": "string",
                                    "additionalProperties": false,
                                    "enum": [
                                        "foo"
                                    ]
                                },
                                "phase": {
                                    "type": "string",
                                    "additionalProperties": false,
                                    "enum": [
                                        "foo"
                                    ]
                                },
                                "location": {
                                    "type": "string",
                                    "additionalProperties": false,
                                    "enum": [
                                        "foo"
                                    ]
                                },
                                "unit": {
                                    "type": "string",
                                    "additionalProperties": false,
                                    "enum": [
                                        "foo"
                                    ]
                                }
                            },
                            "additionalProperties": false,
                            "required": [
                                "value"
                            ]
                        }
                    }
                },
                "additionalProperties": false,
                "required": [
                    "timestamp",
                    "sampledValue"
                ]
            }
        }
    },
    "additionalProperties": false,
    "required": [
        "connectorId",
        "meterValue"
    ]
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
   "connectorId": 1, 
   "meterValue": []
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
action = "MeterValuesRequest";
// define validator
validator = ocpp16_schema_validators.find(validator => validator.schema.title === action);

payload = {
  connectorId: 1,
  meterValue: []
}
// validate payload
valid = validator(payload);

// according to docs
if (!valid) {
  console.error(`[validator] ${identity}`, validator.errors);

} else {
// validation failed                               
```

**Validation result, data AFTER validation, error messages**

```javascript
valid === true
```

**What results did you expect?**

I expect that the validation fails because "timestamp" and "sampledValues" is required within "meterValue".

```javascript
valid === false
```

As soon as I try the following, the validation fails, what is correct behaviour:
```json
{
   "connectorId": 1, 
   "meterValue": ["foo"]
}
```

**Are you going to resolve the issue?**
No, I'm not able to