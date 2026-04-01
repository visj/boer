# [1950] `strictRequired` should recognize properties defined in parent schema

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.11.0

**Ajv options object**

```javascript
{ strict: true, strictRequired: true }
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
      "type": "object",
      "properties": {
        "a": {"type": "number"},
        "b": {"type": "number"},
        "c": {"type": "number"},
        "d": {"type": "number"}
      },
      "if": {
        "required": ["a"]
      },
      "then": {
        "required": ["b", "c"]
      }
}
```

**Sample data**

(Does not compile)

**Your code**

```javascript
new Ajv({ strict: true }).compile({
  type: "object",
  properties: {
    a: {type: "number"},
    b: {type: "number"},
    c: {type: "number"},
    d: {type: "number"},
  },
  if: {
    required: ["a"],
  },
  then: {
    required: ["b", "c"],
  },
})
```

**Validation result, data AFTER validation, error messages**

```
Error: strict mode: required property "a" is not defined at "#/if" (strictRequired)
```

**What results did you expect?**
No compile error

**Are you going to resolve the issue?**
I've tried digging into the error, but my attempts to solve it ended up making things worse... Will add notes in comments