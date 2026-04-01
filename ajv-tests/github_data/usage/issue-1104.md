# [1104] Error: no schema with key or ref "https://json-schema.org/draft-07/schema#"

I can't reference the meta schema with HTTPS.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.10.2 (latest)


**Ajv options object**


```javascript
const ajv = new Ajv({ allErrors: true });
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$id": "https://example.com/person.schema.json",
  "$schema": "https://json-schema.org/draft-07/schema#",
  "title": "Person",
  "type": "object"
}
```


**Validation result, data AFTER validation, error messages**

```
Error: no schema with key or ref "https://json-schema.org/draft-07/schema#"
```

**What results did you expect?**

No error.

**Are you going to resolve the issue?**

Don't know yet. 
