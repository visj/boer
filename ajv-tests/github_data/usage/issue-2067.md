# [2067] undefined top-level value is considered valid

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

I'm using version 8.11.0, which is the latest.

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{ strict: true }
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
undefined
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

Repro: https://runkit.com/danielswolf/ajv-issue-undefined

**Validation result, data AFTER validation, error messages**

```
`true` (value is valid)
```

**What results did you expect?**

I expected `undefined` not to be a valid value against the schema `{}`. It is my understanding that this schema allows any valid JSON value, which `undefined` is not.

**Are you going to resolve the issue?**
