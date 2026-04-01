# [1771] The default keyword in oneOf not works

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

ajv version: 8.6.3

**Your code**

```json
'use strict';

const Ajv = require('ajv/dist/2020');

const schema = {
    '$schema': 'https://json-schema.org/draft/2020-12/schema',
    '$id': '/test',
    'oneOf': [
        {
            'type': 'string',
        },

        {
            'type': 'object',
            'required': ['file'],
            'properties': {
                'file': {
                    'type': 'string',
                },

                'names': {
                    'type': 'array',
                    'default': [],
                },
            },
        },
    ],
};

const ajv = new Ajv({
    strict: 'log',
    useDefaults: true,
});

const validate = ajv.compile(schema);

const obj = {
    file: 'abc',
};
validate(obj);

console.log(obj);
```

I have tried the `discriminator` keyword, but still cannot resolve this issue, because `discriminator` requires both `oneOf` keyword and type "object".


**Validation result, data AFTER validation, error messages**

```
strict mode: default is ignored for: data.names
{ file: 'abc' }
```

**What results did you expect?**

```
{ file: 'abc', names: [] }
```

**Are you going to resolve the issue?**

No