# [1752] cannot compile fhir R4 schema

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.6.2
**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```
https://www.hl7.org/fhir/fhir.schema.json.zip
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

```
ajv compile -s schema/fhir.schema.json -o validate_schema.js
```

**Validation result, data AFTER validation, error messages**

```
schema schema/fhir.schema.json is invalid
error: strict mode: unknown keyword: "discriminator"
```

**What results did you expect?**

**Are you going to resolve the issue?**
