# [1949] JTD values form accepts any value

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.11.0 (latest at time of writing)

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
undefined
```

**JSON Type Definition**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  values: {}
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
undefined
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

```typescript
import Ajv from "ajv/dist/jtd";

const ajv = new Ajv();
console.log(ajv.validate({ values: {} }, undefined)); // true, expected false
console.log(ajv.validate({ values: {} }, null)); // true, expected false
console.log(ajv.validate({ values: {} }, 1)); // true, expected false
console.log(ajv.validate({ values: {} }, "foo")); // true, expected false
```

**Validation result, data AFTER validation, error messages**

```
true
```

**What results did you expect?**

I expected `false`. Unless I misunderstand the documentation, `{ values: {} }` is equivalent to `Record<string, any>`, but it appears to be treated as `any`.

**Are you going to resolve the issue?**

First I'm interested to know if I'm mistaken. I haven't taken a look at the source code to know if I might be able to resolve it myself.

My workaround for the moment is to replace `{ values: {} }` with `{ optionalProperties: { foo: {} }, additionalProperties: true }`.