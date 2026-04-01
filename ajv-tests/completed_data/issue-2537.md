# [2537] check multipleOf precision loss

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "type": "object",
    "properties": {
        "price": {
            "type": "number",
            "multipleOf": 0.01
        }
    },
    "required": [
        "price"
    ]
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "price": 1.11
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
const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}

const schema = {
  type: "object",
  properties: {
    price: { type: "number", "multipleOf": 0.01 },
  },
  required: ["price"]
}

const validate = ajv.compile(schema)

const data = {
  price: 1.11
}

const valid = validate(data)
if (!valid) console.log(validate.errors)



```

**Validation result, data AFTER validation, error messages**

```javascript
[
  {
    instancePath: '/price',
    schemaPath: '#/properties/price/multipleOf',
    keyword: 'multipleOf',
    params: { multipleOf: 0.01 },
    message: 'must be multiple of 0.01'
  }
]
```

**What results did you expect?**
Verification passed

**Are you going to resolve the issue?**
javascript calculation precision is lost 。 
1.11/0.01 = 111.00000000000001