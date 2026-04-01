# [1662] `schemaPath` in `ajv.errors` does not show complete path info

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.6.0

**Ajv options object**
<!-- See https://ajv.js.org/options.html -->

```javascript
{}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
var schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "additionalProperties": false,
    "definitions": {
        "Def2": {
            "additionalProperties": false,
            "properties": {
                "prop3": {
                    "type": "string"
                },
            },
            "required": [
                "prop3"
            ],
            "type": "object"
        },
        "Def1": {
            "additionalProperties": false,
            "properties": {
                "condition": {"$ref": "#/definitions/Def2"},
                "prop2": {
                    "enum": [
                        "good_enum"
                    ],
                    "type": "string"
                }
            },
            "required": [
                "prop2"
            ],
            "type": "object"
        }
    },
    "properties": {
        "prop1": {
            "items": {
                "$ref": "#/definitions/Def1"
            },
            "type": "array"
        }
    },
    "required": [
        "prop1"
    ],
    "type": "object"
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
var data = {
  "prop1": [
    {
      "prop2": "bad_enum",
    }
  ]
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

Full code: https://runkit.com/yilu1021/60d870c41eee9b001af6d9ff
```javascript
var Ajv = require('ajv'); //version 8.6.0
ajv = new Ajv({});
var validate = ajv.compile(schema);
validate(data);
console.log(validate.errors);
```

**AFTER validation, error messages**
validate.errors:
```
[{
	"instancePath": "/prop1/0/prop2",
	"schemaPath": "#/properties/prop2/enum",
	"keyword": "enum",
	"params": {
		"allowedValues": ["good_enum"]
	},
	"message": "must be equal to one of the allowed values"
}]

```

**What results did you expect?**
`schemaPath` should list the full path like below, instead of what's shown above.
```
[{
	"instancePath": "/prop1/0/prop2",
	"schemaPath": "#/definitions/Def1/properties/prop2/enum",
	"keyword": "enum",
	"params": {
		"allowedValues": ["good_enum"]
	},
	"message": "must be equal to one of the allowed values"
}]
```

Note that if you comment out the schema section highlighted in red rectangle below, then `schemaPath` does print out the full path (full code: https://runkit.com/yilu1021/60d881b9065cb6001a57b04c):
![image](https://user-images.githubusercontent.com/62061684/123546915-a0214580-d72c-11eb-948b-84997aa95f51.png)
