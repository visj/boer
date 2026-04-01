# [895] Not able to validate draft-04 schema

Ajv version: 6.5.0

Whenever I try to validate draft-04 jsonschema, I get this error:
Error: no schema with key or ref "http://json-schema.org/draft-06/schema#"
    at Ajv.validate (ajv.js:92)
    at Ajv.validateSchema (ajv.js:178)
    at Ajv._addSchema (ajv.js:312)
    at Ajv.compile (ajv.js:112)

**JSON Schema**
```
{
  "type": "object",
  "title": "Contact",
  "properties": {
    "home": {
      "title": "home",
      "type": "string"
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
}
```