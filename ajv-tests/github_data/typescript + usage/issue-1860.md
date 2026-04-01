# [1860] JSON Type Definition ok when inlined, fails when imported

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.8.2

**Ajv options object**
```javascript
{allErrors: true, validateSchema: "log"}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "properties": {
    "string": {"type": "string"}
  }
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
import Ajv from "ajv/dist/jtd"
import * as rangeTypeDef from "./BeamRange.typedef.json"

const ajv = new Ajv({allErrors: true, validateSchema: "log"})
ajv.addSchema(rangeTypeDef, "range")
const validate = ajv.compile(rangeTypeDef)
```

**Validation result, data AFTER validation, error messages**
```
strict mode: unknown keyword: "default"
```

**What results did you expect?**
Validation to pass without errors, which works if I inline the JSON Type def instead of importing it:
```javascript
import Ajv from "ajv/dist/jtd"

const ajv = new Ajv({allErrors: true, validateSchema: "log"})
const rangeTypeDef = {
   properties: {
      string: {type: "string"}
   }
}
ajv.addSchema(rangeTypeDef, "range")
const validate = ajv.compile(rangeTypeDef)
```

**Are you going to resolve the issue?**
No, but I could see while debugging that there is indeed a `default` property created in the `schema` object:
```javascript
{
  properties: {
    string": {
      type: "string"
    }
  },
  default: {  // <-- Why this when importing?
    properties: {
      string: {
        type: "string"
      }
    }
  }
}
```
It suspect this is related to the `default` exported value of a module.   