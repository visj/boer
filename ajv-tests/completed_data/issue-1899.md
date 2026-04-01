# [1899] Using `discriminator` in a definition causes failure to compile if `oneOf` contains a reference

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

`8.10.0`

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{ discriminator: true }
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "object",
  "properties": {
    "container": {
      "$ref": "#/definitions/Container"
    }
  },
  "definitions": {
    "Block": {
      "type": "object",
      "properties": {
        "_type": {
          "type": "string",
          "enum": ["foobar"]
        }
      },
      "required": ["_type"],
      "title": "Block"
    },
    "Container": {
      "type": "object",
      "properties": {
        "object": {
          "type": "object",
          "oneOf": [
            {
              "$ref": "#/definitions/Block"
            }
          ],
          "discriminator": {
            "propertyName": "_type"
          },
          "required": ["_type"]
        },
        "array": {
          "type": "array",
          "items": {
            "oneOf": [
              {
                "$ref": "#/definitions/Block"
              }
            ],
            "discriminator": {
              "propertyName": "_type"
            },
            "required": ["_type"]
          }
        }
      }
    }
  }
}
```

**Sample data**

n/a

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
var ajv = new Ajv(options);
var validate = ajv.compile(schema);
```

**Validation result, data AFTER validation, error messages**

```
Error: discriminator: oneOf subschemas (or referenced schemas) must have "properties/_type"
```

**What results did you expect?**

The schema to compile.

**Are you going to resolve the issue?**

Not immediately. 

**Reproduction**

https://runkit.com/mshick/620a919455b3e30009ef1f50