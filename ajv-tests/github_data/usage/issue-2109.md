# [2109] Meta-Schema-Validation not working / no guide available

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Integrating Ajv2019 from `"ajv": "^6.12.6",` with Angular

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript

 const ajv = new Ajv2019({allErrors: true});

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

Use case: Trying to validate custom schemas against meta schema draft 2019-09
e.g:

```json

{
    "$schema": "https://json-schema.org/draft/2019-09/schema",
    "$id": "https://example.com/schemas/template.json",
    "title": "Template",
    "type": "object",
    "properties": {},
    "required": [],
    "additionalProperties": false
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

const ajv = new Ajv2019({allErrors: true});
 valid = ajv.validateSchema(json);
errors = ajv.errors;

```

**Validation result, data AFTER validation, error messages**

```
no schema with key or ref "https://json-schema.org/draft/2019-09/schema"

```

**What results did you expect?**

Meta-Schema validation working.

**Are you going to resolve the issue?**


