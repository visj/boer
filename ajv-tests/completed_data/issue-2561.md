# [2561] `multipleOf` validation is incorrect for large integers

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Latest (v8.17.1)

**Ajv options object**

Any options.

**JSON Schema**

```json
{ "multipleOf": 1 }
```

**Sample data**

```json
1e21
```

**What results did you expect?**

1e21 should validate against `multipleOf: 1`, but it doesn't.

**Are you going to resolve the issue?**

Yup: https://github.com/ajv-validator/ajv/pull/2562