# [1625] No tracking of patternProperties with true schemas as their values

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.5.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "object",
  "patternProperties": {
    "^x-": true
  },
  "unevaluatedProperties": false
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "x-internal": false
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
import Ajv from 'ajv/dist/2020';

const ajv = new Ajv();

const schema = {
  type: 'object',
  patternProperties: {
    '^x-': true,
  },
  unevaluatedProperties: false,
};

const validate = ajv.compile(schema);
validate({ 'x-internal': false });
```

**Validation result, data AFTER validation, error messages**

```js
[
  {
    instancePath: '',
    schemaPath: '#/unevaluatedProperties',
    keyword: 'unevaluatedProperties',
    params: { unevaluatedProperty: 'x-internal' },
    message: 'must NOT have unevaluated properties'
  }
]

```

**What results did you expect?**

No errors

**Are you going to resolve the issue?**

Yes

---

Very likely to be caused by https://github.com/ajv-validator/ajv/blob/master/lib/vocabularies/applicator/patternProperties.ts#L16
