# [1401] Question: selectively disable strict types for specific definition or file?

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
v7.0.3

**Ajv options object**
ajv-cli -> ajv compile --all-errors -c ajv-errors

I have the below JSON schema which I'd like to generate one error for the object type check for `authors+`. To accomplish this I omit `"type": "object"` in both the referenced definitions which just have a `properties` field. This is similar to the example at the bottom of the [strict-mode docs](https://github.com/ajv-validator/ajv/blob/master/docs/strict-mode.md#strict-types) except I'm use `$ref`.

The type in `authors+ items` applies and all works well except I do get logged warnings for `strictTypes` for the referenced definitions which is expected. Is there any way to selectively disable strictTypes just for these two definitions or perhaps even just a file? I've scoured the FAQ and searched and I gather the answer is no.  I couldn't get ajv-errors to create a single error either when `"type": "object"`is in the referenced definitions. So for the time being I have to disable strict types for the entire compilation step which I'd rather not do if possible. Conceivably this is an enhancement request for the ability to selectively disable strictTypes. Thanks for your work on `ajv`.

**JSON Schema**

```json
    "authors+": {
      "items": {
        "allOf": [
          { "$ref": "#/definitions/properties-author" },
          { "$ref": "#/definitions/properties-author+" }
        ],
        "type": "object",
        "title": "An object value"
      },
      "title": "An array of items",
      "type": "array"
    },
    "properties-author": {
      "properties" : {...}
    },
    "properties-author+": {
      "properties" : {...}
    }
```