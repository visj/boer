# [1571] strictRequired error when required properties exists and are declared inside oneOf


Using version 8.1.0 with `strict` mode enabled, an error of type `strictRequired` is thrown when `required` properties are declared inside `oneOf` even if those properties are defined next to `oneOf`.

**Ajv options object**

```javascript
const ajv = new Ajv({
  strict: true,
})
```

**JSON Schema**

```json
{
  "type": "object",
  "properties": {
    "property_a": {
      "type": "string",
    },
    "property_b": {
      "type": "string",
    },
  },
  "anyOf": [
    { "required": [ "property_a" ] },
    { "required": [ "property_b" ] }
  ]
}
```

**Sample data**

```json
{
  property_a: 'ok'
}
```

**Your code**

The code posted on [runkit](https://runkit.com/wdavidw/6087daa78dfb850013091d39) throw an error with the message `strict mode: required property "property_a" is not defined at "#/anyOf/0" (strictRequired)` (after switching from stack trace viewer to properties viewer in the UI)

**What results did you expect?**

Unless I am misunderstanding something, I expect the code to be valid since `property_a` is defined inside `properties`.

**Are you going to resolve the issue?**

This probably requires a deep understanding of Ajv internals.
