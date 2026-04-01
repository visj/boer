# [1134] Encoded definition names pass full schema validation but throws during validation

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

We encode definition names as well as the uri component in $ref as AWS requires it.
The schema passes full validation in AJV, but throws missing ref error when attempt to use it to validate. It expects the definition names to be unencoded.

Ideally the below schema would work during validation, but if not supported validateSchema should throw.


**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.10.2


**Ajv options object**

`var ajv = new Ajv({allErrors: true, format: 'full'});`



**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
var schema = {

    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
        "Base%3Cboolean%3E": {
            "additionalProperties": false,
            "properties": {
                "a": {
                    "type": "boolean"
                }
            },
            "required": [
                "a"
            ],
            "type": "object"
        },
        },
        "properties":{
          "test": {"$ref": "#/definitions/Base%3Cboolean%3E"}
        }
}
;

```




https://runkit.com/thejuan/ajv-1131
