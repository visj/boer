# [2367] / gets converted to ~1 in errors

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
- 8.12.0 (Yes happen in latest version)

**Ajv options object**
```json
{
  allErrors: true,
  coerceTypes: true,
  useDefaults: 'empty',
  allowUnionTypes: true,
  verbose: true,
}
```
<!-- See https://ajv.js.org/options.html -->

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  type: "object",
  properties: {
    "D/ate/ (DD/MM/YYYY)": {
      type: ["string", "null"],
      default: null,
      customDateChecker: true
    },
  },
  required: [
    "D/ate/ (DD/MM/YYYY)",
  ],
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  'Date (DD-MM-YYYY)': '18-09-2020',
  'D/ate/ (DD/MM/YYYY)': '16/08/2022 ',
  'Date (MM-DD-YYYY)': '12-08-2024',
  'Date (MM/DD/YYYY)': '10-25-2023'
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
const Ajv = require("ajv");
const addKeywords = require('ajv-keywords');

const ajv = new Ajv(options);
addKeywords(ajv);

ajv.addKeyword('customDateChecker', {
  keyword: 'customDateChecker',
  validate: function () {
    return false;
  },
});

const validator = ajv.compile(schema);
const isValid = validator(data);
```

**Validation result, data AFTER validation, error messages**

```
[
  {
    instancePath: '/D~1ate~1 (DD~1MM~1YYYY)',
    schemaPath: '#/properties/D~1ate~1%20(DD~1MM~1YYYY)/customDateChecker',
    keyword: 'customDateChecker',
    params: {},
    message: 'must pass "customDateChecker" keyword validation',
    schema: true,
    parentSchema: { type: [Array], default: null, customDateChecker: true },
    data: '16/08/2022 '
  }
]
```

**What results did you expect?**
```json
[
  {
    instancePath: '/D/ate/ (DD/MM/YYYY)',
    schemaPath: '#/properties/D/ate/ (DD/MM/YYYY)/customDateChecker',
    keyword: 'customDateChecker',
    params: {},
    message: 'must pass "customDateChecker" keyword validation',
    schema: true,
    parentSchema: { type: [Array], default: null, customDateChecker: true },
    data: '16/08/2022 '
  }
]
```

**Are you going to resolve the issue?**
No, occupied with a very tight schedule.