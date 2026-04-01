# [380] fails when id in schema is not a string (invalid schema) - improve error reporting

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
4.10.2

**JSON Schema (please make it as small as possible to reproduce the issue):**

```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "first_name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50
    },
    "last_name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50
    },
    "phone_number": {
      "type": "string",
      "format": "phone"
    },
  },
  "required": [
    "id",
    "first_name",
    "last_name",
    "phone_number"
  ]
}
```


**Data (please make it as small as posssible to reproduce the issue):**

```json
{
  "id": 1,
  "first_name": "Draco",
  "last_name": "Malfoy",
  "phone_number": "+18435550001"
}                   
```

**Your code (please use `options`, `schema` and `data` as variables):**

```javascript

'use strict';

const Ajv = require('ajv');
const schema = require('./contact.schema');
let ajv = Ajv({ allErrors: true });
ajv.addFormat('phone', () => { return true; });
ajv.compile(schema);

exports.validate = function (data) {
    ajv.validate(data);
    return ajv.errors;
};
```

<!--
It would help if you post a working code sample in Tonic notebook and include the link here. You can clone this notebook: https://tonicdev.com/esp/ajv-issue.
-->

**Validation result, data AFTER validation, error messages:**

```
TypeError: id.replace is not a function
    at Function.normalizeId (/XXXX/node_modules/ajv/lib/compile/resolve.js:216:18)
    at _addSchema (/XXXX/node_modules/ajv/lib/ajv.js:282:22)
    at Ajv.validate (/XXXX/node_modules/ajv/lib/ajv.js:94:23)
```

Currently using integer ids in my project. As you can see, ajv is failing because there is no `replace` function on the integer type in Javascript.