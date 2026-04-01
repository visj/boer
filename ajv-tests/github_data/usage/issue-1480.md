# [1480] Maximum call stack size exceeded without loopEnum option

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

7.2.1

**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv/api.md/api.md#options -->
See demo code below

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

See demo code below

**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->
See demo code below

**Your code**

https://stackblitz.com/edit/js-hxwjp8?file=index.js

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

It can be working when reduce the enum data to 1000 rows.


**Validation result, data AFTER validation, error messages**

```
Maximum call stack size exceeded
```

**What results did you expect?**

Expected is pass.

**Are you going to resolve the issue?**

No
