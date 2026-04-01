# [2001] Comma in serialization result

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

**Version: 8.11.0**, **JTD**

**Ajv options object**

```javascript
{
  coerceTypes: 'array',
  useDefaults: true,
  removeAdditional: true,
  uriResolver: fastUri,
  allErrors: false
}
```

**JSON Schema**

```json
{
  "optionalProperties": {
    "test": {
      "type": "boolean"
    },
    "error": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

**Sample data**

```json
{ "error": "Something went wrong" }
```

**Your code**

```javascript
const AjvJTD = require('ajv/dist/jtd')

const ajv = new AjvJTD({
  coerceTypes: 'array',
  useDefaults: true,
  removeAdditional: true,
  uriResolver: fastUri,
  allErrors: false
})
const serialize = ajv.compileSerializer(schema)
const result = serialize(object)
```

**Serialized data (NOTICE COMMA)** 
```
{,"error":"Something went wrong"}
```

**What results did you expect?**

````{"error":"Something went wrong"}````

**Are you going to resolve the issue?**
Yes, look at #2028