# [1892] [JSON Schema] `discriminator` tag is not accounted for `unevaluatedProperties` keyword

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.9.0

**Ajv options object**

```javascript
{ useDefaults: true, coerceTypes: true, discriminator: true }
```

**JSON Schema**

```json
{
  "type": "object",
  "discriminator": { "propertyName": "translatorID" },
  "properties": {
    "type": { "enum": [ "collection", "library" ] },
  },
  "required": [ "translatorID" ],
  "unevaluatedProperties": false,
  "oneOf": [
    {
      "properties": {
        "translatorID": { "const": "f895aa0d-f28e-47fe-b247-2ea77c6ed583" },
        "asciiBibLaTeX": { "type": "boolean" }
      }
    },
    {
      "properties": {
        "translatorID": { "const": "0f238e69-043e-4882-93bf-342de007de19" }
      }
    }
  ]
}
```

**Sample data**

```json
{
  "type": "library",
  "translatorID": "f895aa0d-f28e-47fe-b247-2ea77c6ed583",
  "asciiBibLaTeX": false
}
```

**Your code**

```javascript
const Ajv = require('ajv/dist/2019')
const ajv = new Ajv(options)

const validate = ajv.compile(schema)

const valid = validate(data)
if (!valid) console.log(validate.errors)
```

**Validation result, data AFTER validation, error messages**

```
[
  {
    instancePath: '',
    schemaPath: '#/unevaluatedProperties',
    keyword: 'unevaluatedProperties',
    params: { unevaluatedProperty: 'translatorID' },
    message: 'must NOT have unevaluated properties'
  }
]
```

**What results did you expect?**

I expected the data to validate 

**Are you going to resolve the issue?**

I don't think I can