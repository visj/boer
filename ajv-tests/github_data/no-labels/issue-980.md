# [980] anyOf validation errors only present when other validations fail

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.10.0

**Ajv options object**

```javascript
undefined
```

**JSON Schema**

The schema intends to define a recursive structure. Valid data examples below.

```json
const schema = {
  "$schema": "http://json-schema.org/draft-07/schema",
  "$ref": "#/definitions/stages",
  "definitions": {
    "stages": {
      "type": "array",
      "minItems": 1,
      "items": {
        "anyOf": [
          { "$ref": "#/definitions/stages" },
          { "$ref": "#/definitions/stage" }
        ]
      }
    },
    "stage": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "minLength": 1
        }
      }
    }
  }
};
```


**Sample data**

Invalid

```json
[{ "name": "" }]
```

Valid (flat)

```
[{ "name": "A" }]
```

Valid (nested)

The JSON is a composite structure. It's an array of object or other arrays containing objects.

```
[
  { "name": "A" },
  [
    { "name": "B" },
    { "name": "C" }
  ]
]
```

**Your code**

Demo: https://runkit.com/mseeley/ajv

```javascript
// See demo
```

**Validation result, data AFTER validation, error messages**

Validation fails due to the empty `name` attribute. Data is unchanged.

```
[
  {
    "keyword": "type",
    "dataPath": "[0]",
    "schemaPath": "#/type",
    "params": {
      "type": "array"
    },
    "message": "should be array"
  },
  {
    "keyword": "minLength",
    "dataPath": "[0].name",
    "schemaPath": "#/definitions/stage/properties/name/minLength",
    "params": {
      "limit": 1
    },
    "message": "should NOT be shorter than 1 characters"
  },
  {
    "keyword": "anyOf",
    "dataPath": "[0]",
    "schemaPath": "#/items/anyOf",
    "params": {},
    "message": "should match some schema in anyOf"
  }
]
```

**What results did you expect?**

I'm expecting an `errors` object containing only the failed `minLength` failure as changing `name` to a string with length > 0 causes the test to pass. This to me suggests the other two errors are not truly errors. I can't filter out `anyOf` errors as an array containing anything besides other array or object should fail `anyOf`.

I _believe_ the non minLength errors are related to the anyOf check where the first member of the array could have been another array instead of an object.

**Are you going to resolve the issue?**

I've reviewing the FAQ and grepped for other issues (found #427, #558, #828). I'm unable to determine if this is a usage error, expected output, or an issue in validation.

If this is too close to an SO question please let me know and save yourself some time.

I appreciate any help. Thanks!
