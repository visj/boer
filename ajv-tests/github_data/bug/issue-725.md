# [725] `should NOT have duplicate items` when there are no duplicate items

**What version of Ajv are you using? Does the issue happen if you use the latest version?** 6.2

**Ajv options object**

```javascript
const ajv = new Ajv();
const metaSchema = require("ajv/lib/refs/json-schema-draft-06.json");
ajv.addMetaSchema(metaSchema);
```


**JSON Schema**

```json
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "definitions": {
    "Function": {
      "description": "Creates a new function.",
      "properties": {
        "apply": {
          "description": "Calls the function, substituting the specified object for the this value of the function, and the specified array for the arguments of the function.",
          "type": "object"
        },
        "arguments": {},
        "bind": {
          "description": "For a given function, creates a bound function that has the same body as the original function.\nThe this object of the bound function is associated with the specified object, and has the specified initial parameters.",
          "type": "object"
        },
        "call": {
          "description": "Calls a method of an object, substituting another object for the current object.",
          "type": "object"
        },
        "caller": {
          "$ref": "#/definitions/Function"
        },
        "length": {
          "type": "number"
        },
        "prototype": {},
        "toString": {
          "description": "Returns a string representation of a function.",
          "type": "object"
        }
      },
      "required": [
        "apply",
        "arguments",
        "bind",
        "call",
        "caller",
        "length",
        "prototype",
        "toString"
      ],
      "type": "object"
    }
  },
  "properties": {
    "myFunction": {
      "$ref": "#/definitions/Function"
    }
  },
  "required": [
    "myFunction"
  ],
  "type": "object"
}
```

Error

```
[ { keyword: 'uniqueItems',
    dataPath: '.definitions[\'Function\'].required',
    schemaPath: '#/definitions/stringArray/uniqueItems',
    params: { i: 7, j: [Function: toString] },
    message: 'should NOT have duplicate items (items ## function toString() { [native code] } and 7 are identical)' } ]
```