# [1270] strictKeywords true causes array items false schema to incorrectly validate non-empty array

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.12.4 (latest)

**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv#options -->

```javascript
{ strictKeywords: true }
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{ "type": "array", "items": false }
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
[1]
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
const Ajv = require("ajv");

const ajv = new Ajv({ strictKeywords: true });

ajv.validate({ type: "array", items: false }, [1]);

console.log(ajv.errors);

```


**Validation result, data AFTER validation, error messages**

```
null
```

**What results did you expect?**

same validation error as when `strictKeywords` is `false` or `"log"`

```json
[
  {
    "keyword": "false schema",
    "dataPath": "[0]",
    "schemaPath": "#/items/false schema",
    "params": {},
    "message": "boolean schema is false"
  }
]
```

**Are you going to resolve the issue?**

Am I going to submit a PR? Not planning on it. Am I good with closing the issue after feedback? Yes.