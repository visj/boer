# [2450] Nullable doesn't work on oneOf fields

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.11.0, Also reproduces on 8.12.0

**Ajv options object**


```javascript
{allErrors: true}, {useDefaults: true}

```

**JSON Schema**

Schema 1 (doesn't work)

```json
{
  "type": "object",
  "properties": {
    "foo": {
      "type": "object",
      "oneOf": [
        {
          "type": "object",
          "properties": {
            "foo": {
              "type": "string"
            }
          },
          "required": [
            "foo"
          ]
        },
        {
          "type": "object",
          "properties": {
            "bar": {
              "type": "number",
              "maximum": 3
            }
          },
          "required": [
            "bar"
          ]
        }
      ],
      "nullable": true
    }
  },
  "required": [
    "foo"
  ]
}¡
```

Schema 2 (works)
```json
{
  "type": "object",
  "properties": {
    "foo": {
      "type": "object",
      "oneOf": [
        {
          "type": "object",
          "properties": {
            "foo": {
              "type": "string"
            }
          },
          "required": [
            "foo"
          ]
        },
        {
          "type": "object",
          "properties": {
            "bar": {
              "type": "number",
              "maximum": 3
            }
          },
          "required": [
            "bar"
          ]
        },
        {
          "type": "null"
        }
      ],
      "nullable": true
    }
  },
  "required": [
    "foo"
  ]
}
```

**Sample data**

```json
{"foo": null}
```

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

Runkit: https://runkit.com/embed/f2r6epfwc8h7

```javascript
const Ajv = require("ajv")
const ajv = new Ajv({allErrors: true})

const objectASchema = {
  type: "object",
  properties: {
    foo: {type: "string"},
  },
  required: ['foo']
}

const objectBSchema = {
  type: "object",
  properties: {
    bar: {type: "number", maximum: 3},
  },
  required: ['bar']
}

const schema = {
  type: "object",
  properties: {
    foo: {
      type: "object",
      oneOf: [objectASchema, objectBSchema],
      nullable: true
    }
  },
  required: ['foo']
}

const schema2 = {
  type: "object",
  properties: {
    foo: {
      type: "object",
      oneOf: [objectASchema, objectBSchema, {type: 'null'}],
      nullable: true
    }
  },
  required: ['foo']
}

const validate = ajv.compile(schema)
const validate2 = ajv.compile(schema2)

test({foo: {foo: '5'}})
test({foo: {bar: 2}})
test({foo: null})

test2({foo: {foo: '5'}})
test2({foo: {bar: 2}})
test2({foo: null})


function test(data) {
  console.log("Testing",data);
  const valid = validate(data)
  if (valid) console.log("Valid!")
  else console.log("Invalid: " + ajv.errorsText(validate.errors))
}

function test2(data) {
  console.log("Testing with schema 2",data);
  const valid = validate2(data)
  if (valid) console.log("Valid!")
  else console.log("Invalid: " + ajv.errorsText(validate.errors))
}

```

**Validation result, data AFTER validation, error messages**

```
Testing
Object {foo: Object {foo: "5"}}
Valid!
Testing
Object {foo: Object {bar: 2}}
Valid!
**Testing
Object {foo: null}
Invalid: data/foo must be object, data/foo must be object, data/foo must match exactly one schema in oneOf**
Testing with schema 2
Object {foo: Object {foo: "5"}}
Valid!
Testing with schema 2
Object {foo: Object {bar: 2}}
Valid!
**Testing with schema 2
Object {foo: null}
Valid!**
```

**What results did you expect?**
I would expect that since in both schemas the `foo` field is marked as nullable, `{foo: null}` should pass validation. However, it only passes validation where an explicit `null` option is included in the `oneOf`

**Are you going to resolve the issue?**
I can use the second version of the schema as a workaround for now.