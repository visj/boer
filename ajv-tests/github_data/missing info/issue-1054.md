# [1054] coerceTypes causes schema errors any way

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
"ajv": "^6.10.2",


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{
            allErrors: true,
            schemas: self.subSchemas,
            coerceTypes: 'array',
            // verbose: true,
        }

```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "publish_is_true": {
      "$id": "#/definitions/publish_is_true",
      "type": "object",
      "properties": {
        "UserArea": {
          "properties": {
            "PublishToBA": {
              "const": true
            }
          }
        }
      }
    },
    ...
  },
  "type": "object",
  "required": [
    "PublishToBA"
  ],
  "properties": {
    "PublishToBA": {
      "$id": "#/properties/PublishToBA",
      "type": "boolean",
      "title": "The Publishtoba Schema",
      "default": false,
      "examples": [true]
    },
    ...
  }
}

```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
   ...
    "UserArea": {
        "PublishToBA": "true"
    },
    ...
}

```


**Validation result, data AFTER validation, error messages**
After the first call of `validate` function (I logged `PublishToBA` value and errors):
```
PublishToBA: true
errors:
[ { keyword: 'const',
dataPath: '.UserArea.PublishToBA',
schemaPath:
'#/definitions/publish_is_true/properties/UserArea/properties/PublishToBA/const',
params: [Object],
message: 'should be equal to constant' },

```
As you see, PublishToBA converted to `boolean` forcibly, but validator works with old data, so error about mismatch with `true`  appears

After the second call with modified data and with the same Schema the error disappears.

**What results did you expect?**
I expect that validation will be made after type coerce

**Are you going to resolve the issue?**
