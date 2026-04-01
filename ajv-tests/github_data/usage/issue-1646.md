# [1646] { type: string, format: email } validation appears to fail for some Unicode characters

It appears that `format: email` validation may fail if the email address includes some non-standard Unicode characters like `í`
Validation for the given schema and example works on https://www.jsonschemavalidator.net/

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.6.0

**Ajv options object**

```javascript
{ useDefaults: true }
```

**JSON Schema**

```json
{ "type": "string", "format": "email" }
```

**Sample data**

```json
prívate@test.com
```

**Your code**

```javascript
ajv.validate(schema, data)
```

**Validation result, data AFTER validation, error messages**

```
Validation error: data/user/emailAddress must match format \"email\"
```

**What results did you expect?**
Validation should pass
