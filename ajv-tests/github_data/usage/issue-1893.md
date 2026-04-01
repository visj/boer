# [1893] [Proposal] Support empty enum keyword with validateSchema: false option

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.12.3 - no errors thrown
8.9.0 - throws an error
**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{validateSchema: false}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{enum: []}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json

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
const ajv = new Ajv({validateSchema: false});
ajv.compile({enum:[]}) // throws
```

**Validation result, data AFTER validation, error messages**

```
Error is thrown: "enum must have a non-empty array"
```

**What results did you expect?**
No errors thrown during compilation if `validateSchema` is set to `false`
**Are you going to resolve the issue?**
I would give it a go with guidance on how the error should be handled.

Workaround for consumers of course is just to catch the error, but it's not something I would have expected and I couldn't see it listed as one of the intentional breaking changes.