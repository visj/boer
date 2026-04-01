# [1386] v7: schema compilation is safer but significantly slower than v6 - using standalone validation code

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

In Serverless Framework we've just upgrade AJV from v6 to v7, and observed that `ajv.compile(schema)` execution time for very same schema jumped from ca `0.15s` to `0.8s`.

Is this a known issue?

It can be observed by running any Serverless Framework command, and measuring execution time at this line:

https://github.com/serverless/serverless/blob/bcbbd47fa09b7d99d7f8da3f11150215d1203bba/lib/classes/ConfigSchemaHandler/index.js#L106

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

v7.0.3

**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv/api.md/api.md#options -->

```javascript
{ allErrors: true, coerceTypes: 'array', verbose: true, strict: false }
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

It's a large dynamically generated schema, if needed I can export it to JSON and provide a link

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
const Ajv = require('ajv').default;
const ajv = new Ajv({ allErrors: true, coerceTypes: 'array', verbose: true, strict: false });
ajv.compile(schema);
```