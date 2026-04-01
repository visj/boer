# [1495] removeAdditional & allErrors causing odd validation results

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
7.2.1 (reproducible in 8.0.0-beta.1)

**Ajv options object**

```javascript
{
  removeAdditional: true,
  allErrors: true,
}
```

**JSON Schema**

```json
{
  "oneOf": [
    {
      "type": "object",
      "required": ["type", "a"],
      "properties": {
        "type": { "type": "string", "const": "a" },
        "a": { "type": "string" },
      },
      "additionalProperties": false,
    },
    {
      "type": "object",
      "required": ["type", "b"],
      "properties": {
        "type": { "type": "string", "const": "b" },
        "b": { "type": "string" },
      },
      "additionalProperties": false,
    },
    {
      "type": "object",
      "required": ["type", "c"],
      "properties": {
        "type": { "type": "string", "const": "c" },
        "c": { "type": "string" },
      },
      "additionalProperties": false,
    }
  ],
}
```

**Sample data**

```json
{ "type": "a", "a": "this is a test" } 
{ "type": "b", "b": "this is a test" }
{ "type": "c", "c": "this is a test" }
```

**Your code**

https://runkit.com/nurdism/60507beb0e9871001aacfc1f

```javascript
var Ajv = require('ajv').default;

ajv = new Ajv({
  removeAdditional: true,
  allErrors: true,
});

var schema = {
  "oneOf": [
    {
      "type": "object",
      "required": ["type", "a"],
      "properties": {
        "type": { "type": "string", "const": "a" },
        "a": { "type": "string" },
      },
      "additionalProperties": false,
    },
    {
      "type": "object",
      "required": ["type", "b"],
      "properties": {
        "type": { "type": "string", "const": "b" },
        "b": { "type": "string" },
      },
      "additionalProperties": false,
    },
    {
      "type": "object",
      "required": ["type", "c"],
      "properties": {
        "type": { "type": "string", "const": "c" },
        "c": { "type": "string" },
      },
      "additionalProperties": false,
    }
  ],
};

var validate = ajv.compile(schema);

var a = { "type": "a", "a": "this is a test" }; // passes with "a" missing property
console.log(validate(a));
console.log(validate.errors);

var b = { "type": "b", "b": "this is a test" }; // fails
console.log(validate(b));
console.log(validate.errors);

var c = { "type": "c", "c": "this is a test" }; // fails
console.log(validate(c));
console.log(validate.errors);
```

**What results did you expect?**
all three object to pass validation untouched

**Are you going to resolve the issue?**
no