# [1121] $ref: keywords ignored in schema at path

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
@6.10.2


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{
  allErrors: true
}

```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "type": "object",
    "properties": {
        "code": {
            "type": "number"
        },
        "data": {
            "type": "object",
            "properties": {
                "total": {
                    "type": "number"
                },
                "pcList": {
                    "type": "array",
                    "$ref": "#/definitions/urlList"
                },
                "h5List": {
                    "type": "array",
                    "$ref": "#/definitions/urlList"
                }
            }
        }
    },
    "definitions": {
        "urlList": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "number"
                    },
                    "name": {
                        "type": "string"
                    },
                    "linkTypes": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "id": {
                                    "type": "number"
                                },
                                "name": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
    "code": 200,
    "data": {
        "total": 101,
        "pcList": [
            {
                "id": 1,
                "name": "name",
                "linkTypes": [
                    {
                        "id": 1,
                        "name": "YTMS"
                    },
                    {
                        "id": 2,
                        "name": "itemDetail"
                    }
                ]
            }
        ],
        "h5List": [
            {
                "id": 2,
                "name": "h5Name",
                "linkTypes": [
                    {
                        "id": 1,
                        "name": "YTMS"
                    },
                    {
                        "id": 2,
                        "name": "itemDetail"
                    }
                ]
            }
        ]
    }
}

```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript

const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);
const valid = validate(data);
if (!valid) {
    validate.errors.map(error => {
        console.log(JSON.stringify(error, null, 4));
    });
}
```


**Validation result, data AFTER validation, error messages**

```
$ref: keywords ignored in schema at path "#/properties/data/properties/pcList"

```

**What results did you expect?**

It should not be printed. 

In schema, If I delete the property `type` which value is `array` of `pcList` and `h5List`, the message will be gone, otherwise the message will be printed.

When I saw the message, I think the schema I have created is wrong

but the value of the `valid` is `true`! 

**Are you going to resolve the issue?**
