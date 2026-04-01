# [2321] strict mode fails to invalidate draft-07 schema with additional keywords alongside $ref

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.11.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const ajvOptions = {
    strict: true,
    validateFormats: false,
    discriminator: true,
    verbose: true,
    allErrors: true
};
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "security-x",
  "type": "object",
  "properties": {
    "replace": {
      "$ref": "replace.json",
      "type": "object"
    }
  },
  "additionalProperties": false,
  "minProperties": 1
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
const ajv = new Ajv(options);
registerAjvFormats(ajv);
require("ajv-errors")(ajv, {singleError: false} )
console.log(ajv.validateSchema(schema));
```

**Validation result, data AFTER validation, error messages**

```
true
```

**What results did you expect?**
My understanding is that on draft-07, no other keywords can appear alongside the **"$ref"** keyword, therefore my expectation is that validateSchema would return **false** for the example schema above.

