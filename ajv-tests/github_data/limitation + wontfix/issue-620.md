# [620] Compilation fails when using custom macro keyword with $ref field

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
5.3.0

**Ajv options object**
default

**Code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

This leads to "RangeError: Maximum call stack size exceeded"
when trying to compile

https://runkit.com/errorstream/5a07a100667ea8001263544b
```js
const Ajv = require("ajv");
const ajv = new Ajv();
ajv.addKeyword("interface", {
  macro: (schema, parentSchema) => ({
    $ref: `interfaces.json#/definitions/${schema}`
  })
});
ajv.addSchema(
  {
    definitions: {
      tree: {
        type: "array",
        items: {
          interface: "branch"
        }
      },
      branch: {
        interface: "tree"
      }
    }
  },
  "interfaces.json"
);
const validator = ajv.compile({
  interface: "branch"
});
```

This compiles successfully

https://runkit.com/errorstream/5a07a191ae3c4300124d0727
```js
const Ajv = require("ajv");
const ajv = new Ajv();
ajv.addKeyword("interface", {
  macro: (schema, parentSchema) => ({
    $ref: `interfaces.json#/definitions/${schema}`
  })
});
ajv.addSchema(
  {
    definitions: {
      tree: {
        type: "array",
        items: {
          $ref: "interfaces.json#/definitions/branch"
        }
      },
      branch: {
        $ref: "interfaces.json#/definitions/tree"
      }
    }
  },
  "interfaces.json"
);
const validator = ajv.compile({
  $ref: "interfaces.json#/definitions/branch"
});

```
