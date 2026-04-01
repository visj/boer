# [1078] coerceTypes coerces nulls

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Latest

**Test case**

```js
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
                "name": {"type": "string"},
                "num": {"type": "number"}
            },
            "required": ["id"]
        }
    }
});

const t = v.compile({ '$ref': 'test-schema.json#/definitions/test::Test' });

const obj = { id: "1", name: null, num: null };

t(obj);

console.log(obj);
```

**Validation result, data AFTER validation, error messages**

```
{ id: 1, name: '', num: 0 }
```

**What results did you expect?**

```
{ id: 1 } or { id: 1, name: null, num: null }
```

**Are you going to resolve the issue?**

Maybe