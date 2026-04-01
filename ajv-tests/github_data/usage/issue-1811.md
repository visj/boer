# [1811] "additionalItems" : true give compilation error

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.7.1
**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
  "type": "array",
  "items": [{"type": "number"}, {"type": "boolean"}],
  "minItems": 2,
  "additionalItems" : true
  // "additionalItems" : {"type": "string"}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
[1, true]
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
https://runkit.com/gerryferdinandus/618a696df964580008b00e3c

```javascript

```

**Validation result, data AFTER validation, error messages**

```
"strict mode: \"items\" is 2-tuple, but minItems or maxItems/additionalItems are not specified or different at path \"#\""
```

**What results did you expect?**
These two items should not create any error.
"additionalItems" : true
or
"additionalItems" : {"type": "string"}


But `"additionalItems" : false` give no error

**Are you going to resolve the issue?**
no