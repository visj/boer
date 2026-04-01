# [1496] allOf + additionalProperties: false

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

7.2.1, Yes

**Ajv options object**

Defaults

**JSON Schema**

```json
{
  "allOf": [
    {
      "type": "object",
      "properties": {
        "a": {
          "type": "string"
        }
      },
      "required": [
        "a"
      ],
      "additionalProperties": false
    },
    {
      "type": "object",
      "properties": {
        "b": {
          "type": "number"
        }
      },
      "required": [
        "b"
      ],
      "additionalProperties": false
    }
  ]
}
```

**Sample data**

```json
{ "a": "hello", "b": 3000 }
```

**Your code**

```javascript
const Ajv = require('ajv')

const ajv = new Ajv.default()

const validate = ajv.compile({
  allOf: [
    {
      type: "object",
      properties: {
        a: { "type": "string" }
      },
      required: ["a"],
      additionalProperties: false
    },
    {
      type: "object",
      properties: {
        b: { "type": "number" }
      },
      required: ["b"],
      additionalProperties: false
    }
  ]
})

const success = validate({ a: 'hello', b: 3000 })
const errors = validate.errors
console.log(success, errors)
```

**Validation result, data AFTER validation, error messages**

```javascript
[
  {
    keyword: 'additionalProperties',
    dataPath: '',
    schemaPath: '#/allOf/0/additionalProperties',
    params: { additionalProperty: 'b' },
    message: 'should NOT have additional properties'
  }
]
```

**What results did you expect?**

I guess the expectation here is that this schema should validate. But I'm not sure. There may be ambiguities with respect how to handle inner `allOf` schemas with `additionalProperties`, and especially for `additionalProperties` where the values vary for each inner schema. However, I think the most reasonable interpretation of the above schema would be to interpret it as the following flat schema...

```javascript
{
    type: "object",
    properties: {
      a: { "type": "string" },
      b: { "type": "number" }
    },
    required: ["a", "b"],
    additionalProperties: false
}
```
And perhaps with the following rules for varying `additionalProperties` values.

- If ALL inner `allOf` schemas have `additionalProperties: false`. The validation should assume `additionalProperties: false`.
- If NONE or SOME inner `allOf` schemas have `additionalProperties: false`. The validation should assume `additionalProperties: true`.


