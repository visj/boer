# [2052] schema must be object or boolean

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
v8.11.0

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

const ajv = new Ajv();
```

**Additional trace**
```
core.js:444 Uncaught Error: schema must be object or boolean
    at Ajv._addSchema (core.js:444:1)
    at Ajv.addSchema (core.js:234:1)
    at Ajv.addMetaSchema (core.js:242:1)
    at Ajv._addDefaultMetaSchema (ajv.js:24:1)
    at new Ajv (core.js:114:1)
    at new Ajv (ajv.js:10:1)
    at 
```

**What results did you expect?**
Code to not to crash on `new Ajv()`

**Are you going to resolve the issue?**
No