# [1846] Validation errors when using anyOf with properties field

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.12.2, Yes, it happens with 8.8.2 too
**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{ allErrors: true, removeAdditional: "all", useDefaults: true, strict: 'log' }
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "type": "object",
    "required": [
      "some_array"
    ],
    "properties": {
      "some_array": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "code"
          ],
          "anyOf": [
            {
              "properties": {
                "code": {
                  "const": "some_const"
                },
                "type": {
                  "type": "string"
                },
                "value": {
                  "type": "object",
                  "required": ['a'],
                  "properties": {
                    "a": {
                      "type": "number",
                      "validate": {}
                    }
                  }
                }
              }
            },
            {
              "properties": {
                "code": {
                  "const": "some_const2"
                },
                "type": {
                  "type": "string"
                },
                "value": {
                  "type": "object",
                  "required": ['b'],
                  "properties": {
                    "b": {
                      "type": "number",
                      "validate": {}
                    }
                  }
                }
              }
            }
          ]
        }
      }
    }
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "some_array": [
    {
      "code": "some_const",
      "value": {
        "a": 1
      },
      "type": "object"
    },
    {
      "code": "some_const2",
      "value": {
        "b": 2
      },
      "type": "object"
    }
  ]
}
```

**Your code**

```javascript

const Ajv = require("ajv")
const ajv = new Ajv(options);


const validate = ajv.compile(schema);
const isValid = validate(data);
if (!isValid)
    console.log({errors: validate.errors});
```

**Validation result, data AFTER validation, error messages**

```
{
  errors: [
    {
      instancePath: '/some_array/1/code',
      schemaPath: '#/properties/some_array/items/anyOf/0/properties/code/const',
      keyword: 'const',
      params: [Object],
      message: 'must be equal to constant'
    },
    {
      instancePath: '/some_array/1/value',
      schemaPath: '#/properties/some_array/items/anyOf/0/properties/value/required',
      keyword: 'required',
      params: [Object],
      message: "must have required property 'a'"
    },
    {
      instancePath: '/some_array/1/value',
      schemaPath: '#/properties/some_array/items/anyOf/1/properties/value/required',
      keyword: 'required',
      params: [Object],
      message: "must have required property 'b'"
    },
    {
      instancePath: '/some_array/1',
      schemaPath: '#/properties/some_array/items/anyOf',
      keyword: 'anyOf',
      params: {},
      message: 'must match a schema in anyOf'
    }
  ]
}
```

**What results did you expect?**

Both schema and data seem ok to me. Also I have noticed some funny thing.
If I remove schema.properties.some_array.items.anyOf[1].properties.value.required ( required: ["b"], I've made a typo to highlight it in schema json), there are no errors.
If I swap items of anyOf array and remove the second one again (required: ["a"] in this case), there are no errors
if I remove the first item of anyOf, i still get errors

P.S. sorry for the mess, in my real code both data and schema are automatically generated, did my best to clean the result

