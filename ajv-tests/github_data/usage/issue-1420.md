# [1420] Bug related to combining `removeAdditional` with `oneOf`


**What version of Ajv are you using? Does the issue happen if you use the latest version?**

ajv 7.0.3

**Ajv options object**

```javascript
var options = {
    allErrors: true,
    removeAdditional: 'failing',
}
```

**JSON Schema**

```json
var schema = {
  "$id": "https://example.com/ajv-test.json",
  "definitions": {
    "foo": {
      "type": "object",
      "properties": {
        "foo": { "const": "foo" }
      },
      "required": ["foo"],
      "additionalProperties": false,
    },
    "bar": {
      "type": "object",
      "properties": {
        "bar": { "const": "bar" }  
      },
      "required": ["bar"],
      "additionalProperties": false,
    }
  },
  "oneOf": [
    { "$ref": "#/definitions/foo" },
    { "$ref": "#/definitions/bar" }
  ]
};
```

**Sample data**

```json
var data = {
  "bar": "bar"
};
```

**Your code**

https://runkit.com/cyberix/ajv-issue

```javascript
var Ajv = require('ajv').default;
var ajv = new Ajv(options)
var validate = ajv.compile(schema);

console.log(validate(data));
console.log(validate.errors);
```

**Validation result, data AFTER validation, error messages**

```
false
[
  {
    keyword: 'required',
    dataPath: '',
    schemaPath: '#/definitions/foo/required',
    params: { missingProperty: 'foo' },
    message: "should have required property 'foo'"
  },
  {
    keyword: 'required',
    dataPath: '',
    schemaPath: '#/definitions/bar/required',
    params: { missingProperty: 'bar' },
    message: "should have required property 'bar'"
  },
  {
    keyword: 'oneOf',
    dataPath: '',
    schemaPath: '#/oneOf',
    params: { passingSchemas: null },
    message: 'should match exactly one schema in oneOf'
  }
]
```

**What results did you expect?**

```
true
null
```

The above result is what you get with input `{ "foo": "foo" }` but `{ "bar": "bar" }` fails for some reason. The schema is intended to be symmetric but the order of sub schemas is `oneOf` seems to affect validation behaviour.


**Are you going to resolve the issue?**

Not right now, maybe one day, who knows.