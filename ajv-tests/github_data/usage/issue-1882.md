# [1882] OAS 3.0 schemas cannot make non-nullable references nullable

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.9.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{allErrors: true}
```

**JSON Schema**

```json
{
  "$defs": {
    "Fork": {
      "type": "object",
      "properties": {
        "id": {"type": "string"}
      }
    }
  },
  "type": "object",
  "properties": {
    "id": {"type": "string"},
    "dataFork": {"$ref": "#/$defs/Fork"},
    "resourceFork": {
      "nullable": true,
      "anyOf": [
        {"$ref": "#/$defs/Fork"}
      ]
    }
  }
}
```

> **Note:** The issue relates to use of OAS 3.0's `nullable` keyword, but I replicated without using a complete OAS schema by using JSON schema's `$defs` instead.

**Sample data**

```json
{
  "id": "ffff",
  "dataFork": {"id": "aaaa"},
  "resourceFork": null
}
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

```javascript
const Ajv = require("ajv")
const ajv = new Ajv({allErrors: true})

const schema = {
  "$defs": {
    "Fork": {
      "type": "object",
      "properties": {
        "id": {"type": "string"}
      }
    }
  },
  "type": "object",
  "properties": {
    "id": {"type": "string"},
    "dataFork": {"$ref": "#/$defs/Fork"},
    "resourceFork": {
      "nullable": true,
      "anyOf": [
        {"$ref": "#/$defs/Fork"}
      ]
    }
  }
}

const validate = ajv.compile(schema)

test({
  "id": "ffff",
  "dataFork": {"id": "aaaa"},
  "resourceFork": null
})

function test(data) {
  const valid = validate(data)
  if (valid) console.log("Valid!")
  else console.log("Invalid: " + ajv.errorsText(validate.errors))
}
```

RunKit link - https://runkit.com/liamnichols/61ed680062e12c0008e66e2a

**Validation result, data AFTER validation, error messages**

```
error: "nullable" cannot be used without "type"
```

After adding `"type": "object"`:

```
"Invalid: data/resourceFork must be object, data/resourceFork must match a schema in anyOf"
```

**What results did you expect?**

Sample data to validate without any errors

**Are you going to resolve the issue?**

I dug into the code, but I got stuck and I need guidance on how best to approach the problem.
