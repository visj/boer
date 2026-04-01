# [1687] Typescript build error.

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Versuib: `8.6.1`


**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const ajv = new Ajv();
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
const ajv = new Ajv();

const valid = ajv.validate(schema, {});
```

Error:
```sh
node_modules/ajv/dist/types/json-schema.d.ts:1:92 - error TS1005: '?' expected.

1 declare type StrictNullChecksWrapper<Name extends string, Type> = undefined extends null ? `strictNullChecks must be true in tsconfig to use ${Name}` : Type;
                                                                                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

node_modules/ajv/dist/types/json-schema.d.ts:1:151 - error TS1005: ';' expected.

1 declare type StrictNullChecksWrapper<Name extends string, Type> = undefined extends null ? `strictNullChecks must be true in tsconfig to use ${Name}` : Type;
```
