# [2260] ajv can handle circular $refs, but not circular memory references

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?** 8.12.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{strict: false, logger: false}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```js
const schema = {
  type: 'object',
  properties: {
    value: { type: 'number' },
    // left: { $ref: '#' },
    // right: { $ref: '#' },
  },
  required: ['value'],
};
schema.properties.left = schema;
schema.properties.right = schema;
```

I'm working with a schema in code that has already resolved `$refs` to JS references, so I'd like to be able to use such a schema with `ajv`.

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{ "value": 1, "left": { "value": 5 } }
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

const schema = {
  type: 'object',
  properties: {
    value: { type: 'number' },
    // left: { $ref: '#' },
    // right: { $ref: '#' },
  },
  required: ['value'],
};
schema.properties.left = schema;
schema.properties.right = schema;

const ajv = new Ajv({ strict: false, logger: false });
ajv.validate(schema, { value: 1, left: { value: 5 } });
```

**Validation result, data AFTER validation, error messages**

```
RangeError: Maximum call stack size exceeded
    at _traverse (/Users/andy/github/stainless-3/node_modules/json-schema-traverse/index.js:67:19)
    at _traverse (/Users/andy/github/stainless-3/node_modules/json-schema-traverse/index.js:83:9)
    at _traverse (/Users/andy/github/stainless-3/node_modules/json-schema-traverse/index.js:80:13)
```

**What results did you expect?**

Validation can handle circular references just as well as `$ref`s

**Are you going to resolve the issue?**
