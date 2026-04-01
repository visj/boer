# [2465] console.log cannot be used as a default

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.16.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{allErrors: true, useDefaults: true}

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
{
  type: "object",
  properties: {
    report: {default: console.log}
  }
}

```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json

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
import Ajv from "ajv";

const ajv = new Ajv({allErrors: true, useDefaults: true});

ajv.addKeyword({
  valid: true,
  keyword: "report",
});

const schema = {
  type: "object",
  properties: {
    report: {default: console.log}
  }
}

const validator = ajv.compile(schema);

```

**Validation result, data AFTER validation, error messages**

```
/home/me/apps/dbtest/node_modules/ajv/dist/compile/codegen/code.js:135
        .replace(/\u2028/g, "\\u2028")
        ^

TypeError: Cannot read properties of undefined (reading 'replace')
    at safeStringify (/home/ubuntu/apps/dbtest/node_modules/ajv/dist/compile/codegen/code.js:135:9)
    at stringify (/home/ubuntu/apps/dbtest/node_modules/ajv/dist/compile/codegen/code.js:130:22)
    at assignDefault (/home/ubuntu/apps/dbtest/node_modules/ajv/dist/compile/validate/defaults.js:33:82)
    at assignDefaults (/home/ubuntu/apps/dbtest/node_modules/ajv/dist/compile/validate/defaults.js:10:13)
    at iterateKeywords (/home/ubuntu/apps/dbtest/node_modules/ajv/dist/compile/validate/index.js:218:39)
    at groupKeywords (/home/ubuntu/apps/dbtest/node_modules/ajv/dist/compile/validate/index.js:200:13)
    at /home/ubuntu/apps/dbtest/node_modules/ajv/dist/compile/validate/index.js:192:13
    at CodeGen.code (/home/ubuntu/apps/dbtest/node_modules/ajv/dist/compile/codegen/index.js:439:13)
    at CodeGen.block (/home/ubuntu/apps/dbtest/node_modules/ajv/dist/compile/codegen/index.js:568:18)
    at schemaKeywords (/home/ubuntu/apps/dbtest/node_modules/ajv/dist/compile/validate/index.js:190:9)

Node.js v20.10.0

```

**What results did you expect?**

That "console.log" would be used as the default value. 

**Are you going to resolve the issue?**
