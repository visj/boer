# [1013] Is it possible to use if/then/else which refer to outside property 

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
 ajv: "6.0.1",


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
 { allErrors: true, jsonPointers: true, unknownFormats: 'ignore', $data: true }

```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->


```json
{
  "type": "object",
  "properties": {
    "previous_employment_section": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "companyAddress": {
            "type": "string"
          },
          "companyName": {
            "type": "string"
          }
        },
        "if": {
          "#/properties/isInexperienced": {
            "const": false
          }
        },
        "then": {
          "required": [
            "companyName",
            "companyAddress"
          ]
        }
      }
    },
    "isInexperienced": {
      "type": "boolean"
    }
  }
}

```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
  "previous_employment_section": [],
  "isInexperienced": true
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


```


**Validation result, data AFTER validation, error messages**

```
previous_employment_section[0]: should have required property 'companyName'

```

**What results did you expect?**
 'companyName' and  'companyAddress' should be required only if  'isInexperienced'
 value is false.
**Are you going to resolve the issue?**
