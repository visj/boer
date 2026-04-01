# [428] Schema is not properly validating data

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
4.11.3, latest at the time


**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

```javascript
{allErrors: true, removeAdditional: 'all'}

```


**JSON Schema (please make it as small as possible to reproduce the issue):**

```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "id": "testDefinitions",
  "description": "Test definition schema",

  "type": "array",

  "items": {
    "type": "object",
    "anyOf": [
      {
        "allOf": [
          {
            "allOf": [
              {
                "properties": {
                  "type": {
                    "type": "string",
                    "minLength": 1
                  }
                }
              },
              {
                "required": [
                  "type"
                ]
              }
            ]
          },
          {
            "properties": {
              "type": {
                "enum": [
                  "openUrl"
                ]
              },
              "lineId": {
                "type": "string"
              },
              "url": {
                "type": "string",
                "format": "uri",
                "minLength": 1
              }
            },
            "required": [
              "url"
            ]
          }
        ]
      }
    ]
  }
}


```
Please note the schema is dereferenced, that is why there is a lot of allOf elements

**Data (please make it as small as posssible to reproduce the issue):**

```json
[
	{
		"lineId": 1,
		"type": "openUrl",
		"url": "http://localhost"
	}
]


```


**Your code (please use `options`, `schema` and `data` as variables):**

```javascript
const ajv = new Ajv(options);
return new Promise((resolve, reject) => {
        ajv.validate(schema, data);
        if (ajv.errors === null) {
            resolve(data);
        } else {
            reject(ajv.errors);
        }
    });

```

<!--
It would help if you post a working code sample in Tonic notebook and include the link here. You can clone this notebook: https://tonicdev.com/esp/ajv-issue.
-->
See: https://runkit.com/deep9/ajv-issue


**Validation result, data AFTER validation, error messages:**

```
[ { keyword: 'required',
    dataPath: '[0]',
    schemaPath: '#/items/anyOf/0/allOf/1/required',
    params: { missingProperty: 'url' },
    message: 'should have required property \'url\'' },
  { keyword: 'anyOf',
    dataPath: '[0]',
    schemaPath: '#/items/anyOf',
    params: {},
    message: 'should match some schema in anyOf' } ]

```

**What results did you expect?**
If you run the same schema in http://www.jsonschemavalidator.net, expected result of

> Message:
JSON does not match any schemas from 'anyOf'.
Schema path:
testDefinitions#/items/0/anyOf
Message:
JSON does not match all schemas from 'allOf'. Invalid schema indexes: 1.
Schema path:
testDefinitions#/items/0/anyOf/0/allOf
Message:
Invalid type. Expected String but got Integer.
Schema path:
testDefinitions#/items/0/anyOf/0/allOf/1/properties/lineId/type

**Are you going to resolve the issue?**
Don't know how.
