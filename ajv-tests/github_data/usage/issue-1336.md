# [1336] False Positive error reported for oneOf schema

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Ajv - `6.10.0`
**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv/api.md/api.md#options -->

```javascript
{ allErrors: true }
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "object",
  "properties": {
        "type": {
          "type": "string",
          "enum": ["1", "2"],
          "default": "1"
        }
      },
      "required": ["type"],
      "dependencies": {
        "type": {
          "oneOf": [
            {
              "properties": {
                "type": {
                  "enum": [
                    "1"
                  ]
                },
                "role": {
                  "type": "string"
                }
              },
              "required": [
                "role"
              ]
            },
            {
              "properties": {
                "type": {
                  "enum": [
                    "2"
                  ]
                },
                "ID": {
                  "type": "string"
                }
              },
              "required": [
                "ID"
              ]
            }
          ]
        }
      }
}
```

**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
  "type": "1"
}
```
**Validation result, data AFTER validation, error messages**

```
[
  {
    "keyword": "required",
    "dataPath": "",
    "schemaPath": "#/dependencies/type/oneOf/0/required",
    "params": {
      "missingProperty": "role"
    },
    "message": "should have required property 'role'"
  },
  {
    "keyword": "enum",
    "dataPath": ".type",
    "schemaPath": "#/dependencies/type/oneOf/1/properties/type/enum",
    "params": {
      "allowedValues": [
        "2"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "required",
    "dataPath": "",
    "schemaPath": "#/dependencies/type/oneOf/1/required",
    "params": {
      "missingProperty": "ID"
    },
    "message": "should have required property 'ID'"
  },
  {
    "keyword": "oneOf",
    "dataPath": "",
    "schemaPath": "#/dependencies/type/oneOf",
    "params": {
      "passingSchemas": null
    },
    "message": "should match exactly one schema in oneOf"
  }
]
```

**What results did you expect?**
Sample Data contains type: 1 which is part of the allowed values,  but still getting error for it - 
```
 {
    "keyword": "enum",
    "dataPath": ".type",
    "schemaPath": "#/dependencies/type/oneOf/1/properties/type/enum",
    "params": {
      "allowedValues": [
        "2"
      ]
    },
    "message": "should be equal to one of the allowed values"
  }
```

Error should not be reported is value matches any of the allowed values. It should contain errors related to other missing fields. Let me know if i have missed something here.

**Are you going to resolve the issue?**
Don't think so.