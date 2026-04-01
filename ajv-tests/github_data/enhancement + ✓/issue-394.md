# [394] Throw exception if $schema is present and it is not a string

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Latest

**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

```javascript
{}
```


**JSON Schema (please make it as small as possible to reproduce the issue):**

```json

{
  "thing": {
    "type": 123,
  },
}

```


**Data (please make it as small as posssible to reproduce the issue):**

```
n/a
```


**Your code (please use `options`, `schema` and `data` as variables):**

```javascript
const Ajv = require('ajv');
const ajv = new Ajv();

const isValid = ajv.validateSchema({
  thing: {
    type: 123,
  },
});

console.log(isValid); // true ??
```

<!--
It would help if you post a working code sample in Tonic notebook and include the link here. You can clone this notebook: https://tonicdev.com/esp/ajv-issue.
-->


**Validation result, data AFTER validation, error messages:**

```
none
```

**What results did you expect?**
returns `false`

**Are you going to resolve the issue?**
I'd be happy to, unless the issue is I'm doing something wrong (likely)