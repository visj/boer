# [2329] number with multipleOf: 0.01 doesn't always work (e.g. 143.48)

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Latest: 8.12.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

defaults

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```js
{
  type: 'object',
  required: ['price'],
  properties: {
    price: {
      type: 'number',
      multipleOf: 0.01,
      minimum: 0,
    },
  }
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```js
{ price: 143.47 }
```

**Your code**

repl online: https://replit.com/@caub/Ajv-number-float#index.js
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
const Ajv = require('ajv').default;

const ajv = new Ajv({ coerceTypes: true });


const schema = {
  type: 'object',
  required: ['price'],
  properties: {
    price: {
      type: 'number',
      multipleOf: 0.01,
      minimum: 0,
    },
  }
};

console.log(
  ajv.validate(schema, { price: 143.47 }),
  ajv.errors,
);

console.log(
  ajv.validate(schema, { price: 143.48 }),
  ajv.errors,
);
```

**Validation result, data AFTER validation, error messages**

```
true null
false [
  {
    instancePath: '/price',
    schemaPath: '#/properties/price/multipleOf',
    keyword: 'multipleOf',
    params: { multipleOf: 0.01 },
    message: 'must be multiple of 0.01'
  }
]
```

**What results did you expect?**

All valid

**Are you going to resolve the issue?**
