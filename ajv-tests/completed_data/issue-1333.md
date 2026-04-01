# [1333] AdditionalItems is not factored in anyOf

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Issue still happens in v6.12.6.

**Ajv options object**

```javascript
const ajv = new Ajv();
```

**JSON Schema**

```json
{
  "type": "array",
  "items": [{ "type": "number" }, { "type": "boolean" }],
  "anyOf": [
    { "additionalItems": { "type": "number" } },
    { "additionalItems": { "type": "boolean" } }
  ]
}
```

**Sample data**

```json
[42, true, "neither number or boolean"]
```

**Your code**

```javascript
ajv.validate(schema, instance);
```

**Validation result, data AFTER validation, error messages**

```
true
```

**What results did you expect?**

```
false
```

**Are you going to resolve the issue?**

I can if needed. I just want to make sure that the actual result is not expected first 🤔