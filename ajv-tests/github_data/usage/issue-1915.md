# [1915] minimum and maximum constraints (exclusive or not) that use $data references are improperly validated

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.10.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const Ajv2020 = require("ajv/dist/2020")
const ajv = new Ajv2020({$data: true, allErrors:true})
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "$id": "rangeList",
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "array",
    "prefixItems": [
      {
        "type": "number",
        "minimum": 0,
        "exclusiveMaximum": { "$data":  "1/prefixItems/1" }
      },
      {
        "type": "number",
        "exclusiveMinimum": { "$data":  "1/prefixItems/0" },
        "maximum": 100
      }
    ],
    "minItems": 2,
    "items": false   
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
[ 50, 50 ]
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
const Ajv2020 = require("ajv/dist/2020")

const ajv = new Ajv2020({$data: true, allErrors:true})

const schema = {
    "$id": "rangeList",
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "array",
    "prefixItems": [
      {
        "type": "number",
        "minimum": 0,
        "exclusiveMaximum": { "$data":  "1/prefixItems/1" }
      },
      {
        "type": "number",
        "exclusiveMinimum": { "$data":  "1/prefixItems/0" },
        "maximum": 100
      }
    ],
    "minItems": 2,
    "items": false   
}

const validate = ajv.compile(schema)

const data = [ 50, 50 ]

const valid = validate(data)
if (!valid) {
    console.log(validate.errors)
} else {
    console.log("should not be valid")
}

```
RunKit example: https://runkit.com/jimklo/ajv-range-list-validation

**Validation result, data AFTER validation, error messages**

```
true
```

**What results did you expect?**

I expected validation of `[50, 50]` to fail as the `exclusiveMinimum` constraint for index `1` should not permit the value of index `1` to equal the value of index `0`; as well as the `exclusiveMaximum` constraint for index `0` should not permit the value of index `0` to equal the value of index `1`. 

**Are you going to resolve the issue?**

Not sure how to resolve.