# [1704] Discrepancy in treating numbers between v6 and v8

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
ajv@6.12.6 vs ajv@8.6.2

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{ allErrors: true }
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  type: "object",
  properties: {
    foo: {type: "number"},
  },
  required: ["foo"],
  additionalProperties: false,
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{foo: Number.POSITIVE_INFINITY}
```

**RunKit sample**
[RunKit sample](https://runkit.com/gaitat/60f5f51587632e0013db51a2)

**Your code**

```javascript
const validate = ajv.compile(schema)

test({foo: Number.POSITIVE_INFINITY})

function test(data) {
  validate(data) ? console.log("Valid!") :
    console.log("Invalid: " + ajv.errorsText(validate.errors))
}
```

**Validation result, data AFTER validation, error messages**

```
under ajv@6.12.6:
"Valid!"

under ajv@8.6.2:
"Invalid: data/foo must be number"
```

**What results did you expect?**
Expecting that under both versions of ajv the `data` will validate to `true`

**Are you going to resolve the issue?**
No
