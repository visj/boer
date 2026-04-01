# [1606] strict mode: missing type "object" for every "if" inside "allOf"

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
v8.1.0

**Ajv options object**
Any combination of

```javascript
strictTypes: false,
strict: false,
strictSchema: false,
```

**JSON Schema**

```json
"allOf": [
  "if": {
    "properties": {}
  },
  "then": {}
]
```

**Validation result, data AFTER validation, error messages**
```
strict mode: missing type "object" for keyword "properties" at "#" (strictTypes)
```

**What results did you expect?**
No warnings

**Are you going to resolve the issue?**
Adding `"type": "object," prevents the warnings, but is a lot of 'decoration' for schema which otherwise are valid.

```javascript
"allOf": [
  "if": {
    "type": "object",
    "properties": {}
  },
  "then": {}
]
```
