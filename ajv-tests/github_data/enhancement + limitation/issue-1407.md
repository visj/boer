# [1407] Schema validation - A Default value not matching the type of  property does not error on validateSchema/Compile

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
V7.0.3 and yes it happens for previous versions too.

**Ajv options object**
```javascript
{ useDefaults: true }
```

**JSON Schema**
```json
{
    "$schema": "http://json-schema.org/draft-07/schema",
    "type": "object",
    "properties": {
        "test": {
            "type": "boolean",
            "default": "mp3"
        }
    },
    "additionalProperties": false
}
```

**Your code**
https://runkit.com/parora611/ajv-issue

**What results did you expect?**
Error should have been thrown on compile.

**Are you going to resolve the issue?**
Not sure as of now.