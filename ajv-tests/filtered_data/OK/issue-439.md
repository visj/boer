# [439] Validation works incorrectly if the fragment of a remote $ref is missing "type" property.

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
4.11.5


**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

```javascript
{}

```


**JSON Schema (please make it as small as possible to reproduce the issue):**

```javascript
let dataSchema = {
    properties: {},
    searchProperties: {
        // type: 'object',
        properties: {
            value: { type: 'integer' }
        }
    }
};

let responseSchema = {
    properties: {
        data: {
            oneOf: [{
                $ref: 'data-schema#/searchProperties'
            }, {
                type: 'string'
            }]
        }
    }
}
```


**Data (please make it as small as possible to reproduce the issue):**

```json
{ "data": "546" }

```


**Your code (please use `options`, `schema` and `data` as variables):**

```javascript
'use strict';

const ajv = require('ajv');
const validator = new ajv({});

let dataSchema = {
    properties: {},
    searchProperties: {
        // type: 'object',
        properties: {
            value: { type: 'integer' }
        }
    }
};

let responseSchema = {
    properties: {
        data: {
            oneOf: [{
                $ref: 'data-schema#/searchProperties'
            }, {
                type: 'string'
            }]
        }
    }
}

validator.addSchema(dataSchema, 'data-schema');

let responseData = { data: '546' };

let isValid = validator.validate(responseSchema, responseData);

console.log(isValid);
console.log(validator.errors);

```

<!--
It would help if you post a working code sample in Tonic notebook and include the link here. You can clone this notebook: https://tonicdev.com/esp/ajv-issue.
-->


**Validation result, data AFTER validation, error messages:**

```
false
[ { keyword: 'oneOf',
    dataPath: '.data',
    schemaPath: '#/properties/data/oneOf',
    params: {},
    message: 'should match exactly one schema in oneOf' } ]

```

**What results did you expect?**
```
true
null
```
It is worth noting that if I uncomment the `type: "object"` in the data schema, it magically works.

**Are you going to resolve the issue?**
No