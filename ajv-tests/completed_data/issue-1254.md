# [1254] Error: no schema with key or ref "http://json-schema.org/draft-04/schema#"

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.12.3 (Latest, installed today)

**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv#options -->

```javascript
{}
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "title": "HeartbeatRequest",
    "type": "object",
    "properties": {},
    "additionalProperties": false
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{}
```


**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
const Ajv = require('ajv');
const ajv = new Ajv(options);
const validate = ajv.compile(schema);
```


**Validation result, data AFTER validation, error messages**

```
Error: no schema with key or ref "http://json-schema.org/draft-04/schema#"
```

**What results did you expect?**

A validator function should be returned

**Are you going to resolve the issue?**

No