# [1501] Cannot set more than 8 properties

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
7.2.1

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "properties": {
    "attr1": { "type": "string" },
    "attr2": { "type": "boolean" },
    "attr3": { "type": "int8" },
    "attr4": { "type": "int8" },
    "attr5": { "type": "uint8" },
    "attr6": { "type": "int16" },
    "attr7": { "type": "uint16" },
    "attr8": { "type": "int32" },
    "attr9": { "type": "uint32" }
  }
}
```

**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
  "attr1": "foo",
  "attr2": true,
  "attr3": 0,
  "attr4": 0,
  "attr5": 0,
  "attr6": 0,
  "attr7": 0,
  "attr8": 0,
  "attr9": 0
}
```

**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
const ajvjtd = require('ajv/dist/jtd').default;
console.log((new ajvjtd()).compile(schema)(data));
```

**What results did you expect?**
It logs `false` but should be `true`, removing any property makes it work.

**Are you going to resolve the issue?**
No