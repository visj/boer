# [409] v4 draft meta-schemas reference issue

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
5.0.1-b3

**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

No custom options.

**JSON Schema (please make it as small as possible to reproduce the issue):**

```json
{
  "$schema": "http://json-schema.org/draft-04/hyper-schema#"
}
```

**Your code (please use `options`, `schema` and `data` as variables):**

```javascript
ajv.validateSchema(MySchema)) {
```

**Validation result, data AFTER validation, error messages:**

```
Error: no schema with key or ref "http://json-schema.org/draft-04/hyper-schema#"
```

**What results did you expect?**
I expect the schema and hyper-schema to be loaded and it reference recognized as explained in the docs.

**Are you going to resolve the issue?**
I solved it by loading them by my self. Not a good solution.