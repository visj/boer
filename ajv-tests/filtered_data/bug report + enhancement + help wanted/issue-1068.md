# [1068] $ref does not resolve reference to $id when domain name within $id contains capital letters

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Happens with latest Version: 6.10.2

**Ajv options object**
None

**JSON Schema A**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "http://Test.com/Schemas/testSchema.json",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "test": {
      "type": "string"
    }
  }
}
```

**JSON Schema B that references Schema A**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://Test.com/Schemas/testReference.json",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "testReference": {
      "$ref": "http://Test.com/Schemas/testSchema.json"
    }
  } 
}
```

**Your code**

```javascript
...
const ajv = new Ajv({});
ajv.addSchema(schemaA);
const valid = ajv.validate(schemaB, data);
...
```

**Validation result, data AFTER validation, error messages**
```
can't resolve reference http://Test.com/Schemas/testSchema.json from id https://test.com/Schemas/testReference.json#
```

If the $id of schema is "http://Test.com/Schemas/testSchema.json", there is no possible valid reference to this $id.
Neither "$ref": "http://Test.com/Schemas/testSchema.json" nor "http://test.com/Schemas/testSchema.json" does work.
Both return "can't resolve reference ...".

**What results did you expect?**
No Error.
As the Domainname should not be case sensitive, any Definition and any Reference should work with any capital Letter.

**Are you going to resolve the issue?**
No