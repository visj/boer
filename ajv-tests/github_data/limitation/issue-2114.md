# [2114] useDefault option not working

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
{
  useDefaults: "empty", // 'empty' or true
  allErrors: true,
  coerceTypes: true,
  parseDate: true,
}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "type": "object",
    "properties": {
      "disabled": {
        "type": "boolean",
        "default": false,
        "description": "Disable real redis connection for use a mock"
      },
      "clientOptions": {
        "type": "object",
        "properties": {
          "host": { "type": "string", "default": "localhost" },
          "port": { "type": "number" },
          "auth_pass": { "type": "string" }
        },
        "required": ["host"],
        "description": "Client options for redis connection"
      }
    },
    "oneOf": [
      { "properties": { "disabled": { "const": true } } },
      { "required": ["clientOptions"] }
    ],
    "required": ["disabled"]
  }
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->
Sample 1 (OK, just for test)
```json
{ "disabled": false }
```
Sample 2 (ISSUED)
```json
{  }
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
const Ajv = require("ajv");

const validator = new Ajv(options);

// Validation 1
const result1 = validator.validate(schema, data1); // (SAMPLE 1) Expected false and its ok

// Validation 2 Here its the problem
const result2 = validator.validate(schema, data2); // (SAMPLE 2) Expected false but returns true ??
```

**Validation result, data AFTER validation, error messages**

```
SAMPLE 1 OK!
// valid: false
[
  {
    instancePath: '/disabled',
    schemaPath: '#/oneOf/0/properties/disabled/const',
    keyword: 'const',
    params: { allowedValue: true },
    message: 'must be equal to constant'
  },
  {
    instancePath: '',
    schemaPath: '#/oneOf/1/required',
    keyword: 'required',
    params: { missingProperty: 'clientOptions' },
    message: "must have required property 'clientOptions'"
  },
  {
    instancePath: '',
    schemaPath: '#/oneOf',
    keyword: 'oneOf',
    params: { passingSchemas: null },
    message: 'must match exactly one schema in oneOf'
  }
]

SAMPLE 2 UNEXPECTED!!
// valid: true
nulll
```

**What results did you expect?**
With the `useDefault` property specified, i expect the behaviour for Sample1 and Sample2 would be the same and both fails cause takes the same `false` value <failing schema cause `clientOptions` its required by `oneOf`>
Expect same result when `disabled` its `false` (Sample1 its explicit and Sample2 its by default)

**Are you going to resolve the issue?**
Not sure
