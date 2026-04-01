# [2594] Fail to validate a time value.

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
`ajv: 8.18.0` and `ajv-formats: 3.0.1`
**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{allErrors: true}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type":"object",
  "properties":{
    "time":{"type":["string","null"],"oneOf":[{"type":"string","format":"time"},{"type":"null"}]}
  },
  "required":[],
  "additionalProperties":false
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{time: "01:00:00"}
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
import Ajv from 'ajv';
import addErrors from 'ajv-errors';
import addFormats from 'ajv-formats';

const ajv = new Ajv({allErrors: true});
addFormats(ajv);
addErrors(ajv);

const validate = ajv.compile(schema);
validate(sampleData);
```

**Validation result, data AFTER validation, error messages**

```
[
  {
    instancePath: '/time',
    schemaPath: '#/properties/time/oneOf/0/format',
    keyword: 'format',
    params: { format: 'time' },
    message: 'must match format "time"'
  },
  {
    instancePath: '/time',
    schemaPath: '#/properties/time/oneOf/1/type',
    keyword: 'type',
    params: { type: 'null' },
    message: 'must be null'
  },
  {
    instancePath: '/time',
    schemaPath: '#/properties/time/oneOf',
    keyword: 'oneOf',
    params: { passingSchemas: null },
    message: 'must match exactly one schema in oneOf'
  }
]
```

**What results did you expect?**
`validate` function should return `true`.
**Are you going to resolve the issue?**
