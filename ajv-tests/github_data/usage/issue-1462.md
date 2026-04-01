# [1462] Unknown Keyword dependentRequired

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
7.1.1

**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv/api.md/api.md#options -->

```javascript
None
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "type": "object",
    "properties": {
        "a": {
            "type": "string",
        },
        "b": {
            "type": "number"
        },
    },
    "dependentRequired": {}
};
```

**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
    "a": "test",
    "b": 0
}
```

**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
"use strict";

const Ajv = require("ajv").default;

const ajv = new Ajv();

const schema = {
    type: "object",
    properties: {
        a: {
            type: "string",
        },
        b: {
            type: "number"
        },
    },
    // maxProperties: 2,
    // minProperties: 2,
    // required: ['c']
    dependentRequired: {}
};

const validate = ajv.compile(schema);

validate({
    a: "test",
    b: 0
});

console.dir(validate.errors, { depth: undefined });
```

**Validation result, data AFTER validation, error messages**

```
/Users/andrewgentile/Developer/ajv-dependent-required/node_modules/ajv/dist/compile/index.js:118
        throw e;
        ^

Error: strict mode: unknown keyword: "dependentRequired"
    at Object.checkStrictMode (/Users/andrewgentile/Developer/ajv-dependent-required/node_modules/ajv/dist/compile/validate/index.js:183:15)
```

**What results did you expect?**
dependentRequired exists in the 2019-09 version, so I should be able to use this keyword without an error. 

**Are you going to resolve the issue?**
Cannot commit to it at this time, but will make an attempt. 