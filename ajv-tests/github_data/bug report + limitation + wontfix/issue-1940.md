# [1940] V6 does not resolve relative references to base URI

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
This is only native to v6 as v8 does NOT have this problem.

**Ajv options object**
None.

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "$id": "http://test.com/schema/root",
  "type": "object",
  "required": ["asyncapi"],
  "properties": {
    "asyncapi": {
      "type": "string"
    },
    "ref": {
      "$ref": "http://test.com/schema/test"
    }
  },
  "definitions": {
    "http://test.com/schema/test": {
      "$schema": "http://json-schema.org/draft-07/schema",
      "$id": "http://test.com/schema/test",
      "additionalProperties": false,
      "properties": {
        "testprop": {
          "$ref": "#"
        }
      }
    }
  }
}

```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "asyncapi": "test",
  "ref": {
    "testprop": {
      "testprop": "test"
    }
  }
}
```

**Your code**

```javascript
const Ajv = require("ajv")
const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}

const schema = {
  "$schema": "http://json-schema.org/draft-07/schema",
  "$id": "http://test.com/schema/",
  "type": "object",
  "required": ["asyncapi"],
  "properties": {
    "asyncapi": {
      "type": "string"
    },
    "ref": {
      "$ref": "http://test.com/schema/test"
    }
  },
  "definitions": {
    "http://test.com/schema/test": {
      "$schema": "http://json-schema.org/draft-07/schema",
      "$id": "http://test.com/schema/test",
      "additionalProperties": false,
      "properties": {
        "testprop": {
          "$ref": "#"
        }
      }
    }
  }
}


const validate = ajv.compile(schema)

const data = {
  asyncapi: "test",
  ref: {
    testprop: {
      testprop: "test"
    }
  }
}

const valid = validate(data)
if (!valid) console.log(validate.errors)

```

**Validation result, data AFTER validation, error messages**
With v6.12.6, the follow error occurs:
```
keyword: "required"
dataPath: ".ref.testprop"
schemaPath: "#/required"
params: Object
message: "should have required property 'asyncapi'"
```

**What results did you expect?**
I expected the input to be validated accurately.

**Are you going to resolve the issue?**
Probably upgrade to v8 unless it breaks too many things.
