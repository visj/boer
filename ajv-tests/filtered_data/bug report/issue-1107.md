# [1107] oneOf with type: null breaks validation

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Latest

**Test case**

```javascript
const ajv = require('ajv');

const v = new ajv({ removeAdditional: true, coerceTypes: true });

v.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

v.addSchema({
    "$id": "test-schema.json",
    "$schema": "http://json-schema.org/draft-06/schema#",
    "definitions": {
        "test::Test": {
            "type": "object",
            "properties": {
                "id": {"type": "number"},
                "name": {"oneOf": [{"type": "string"}, {"type": "null"}]},
                "num": {"type": "number"}
            },
            "required": ["id"]
        }
    }
});

const t = v.compile({ '$ref': 'test-schema.json#/definitions/test::Test' });

const obj = { id: "1", name: null, num: "2" };

t(obj);

console.log(t.errors);

console.log(obj);
```

**Validation result, data AFTER validation, error messages**

```
[
  {
    keyword: 'oneOf',
    dataPath: '.name',
    schemaPath: 'test-schema.json#/definitions/test::Test/properties/name/oneOf',
    params: { passingSchemas: [Array] },
    message: 'should match exactly one schema in oneOf'
  }
]
{ id: 1, name: null, num: '2' }
```

**What results did you expect?**

```
{ id: 1, name: null, num: 2 }
```