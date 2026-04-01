# [1980] Property can't contain a slash 


**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.11.0, I believe I am on latest
**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{ allErrors: true }
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
"schema": {
      "$comment": "https://spec.openapis.org/oas/v3.1.0#schema-object",
      "type": ["object", "boolean"]
    },
"media-type": {
      "$comment": "https://spec.openapis.org/oas/v3.1.0#media-type-object",
      "type": "object",
      "properties": {
        "schema": {
          "$ref": "#/definitions/schema"
        }
      },
      "unevaluatedProperties": false
    },
"content": {
      "$comment": "https://spec.openapis.org/oas/v3.1.0#fixed-fields-10",
      "type": "object",
      "additionalProperties": {
        "$ref": "#/definitions/media-type"
      },
      "propertyNames": {
        "enum": ["application/json"]
      }
    }
```

**Sample data**

```json
 "content": {
            "application/json": {
              "schema": {
                "type": "string",
                "description": "Order ID"
              }
            }
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
ajv = new AJV2019({ allErrors: true });
ajv.addMetaSchema(draft7MetaSchema);
addFormats(ajv, { mode: "fast" });
const ajvFunction = ajv.compile(schema);
ajvFunction(data)
```

**Validation result, data AFTER validation, error messages**

```
Expected "}" but found "/"
```
<img width="290" alt="image" src="https://user-images.githubusercontent.com/11202679/167972902-8e4c52bc-cc2a-4878-b80a-7d563976a541.png">


**What results did you expect?**
I expected this data to validate correctly. In Open API you can construct a [Response Object](https://spec.openapis.org/oas/v3.1.0#response-object) which has a `content` property that maps a `MIME type` (ex. application/json) to a `Media Type Object`
**Are you going to resolve the issue?**
I don't know how
