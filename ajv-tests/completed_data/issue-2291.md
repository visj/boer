# [2291] Custom format using global regex flag `/g` is invalid every other run

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Latest (8.12.0)
**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{allErrors: true}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  type: "object",
  properties: {
    foo: {type: "string", format: 'test'},
  },
  required: ["foo"],
  additionalProperties: false,
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{foo: "abc"}
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
https://runkit.com/embed/h6uqiqwo8hal
```javascript
const Ajv = require("ajv")
const ajv = new Ajv({allErrors: true}).addFormat('test', /abc/g)

const validate = ajv.compile(schema)

test(data)
test(data)
test(data)
test(data)

function test(data) {
  const valid = validate(data)
  if (valid) console.log("Valid!")
  else console.log("Invalid: " + ajv.errorsText(validate.errors))
}

```

**Validation result, data AFTER validation, error messages**

```
"Valid!"
"Invalid: data/foo must match format \"test\""
"Valid!"
"Invalid: data/foo must match format \"test\""
```

**What results did you expect?**
Valid four times
**Are you going to resolve the issue?**
If I can figure it out, yes