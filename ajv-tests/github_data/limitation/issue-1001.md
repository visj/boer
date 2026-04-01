# [1001] Validate with #/.. does't work when used with custom keywords

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.10

**Ajv options object**
**JSON Schema**
**Sample data**
**Your code**

https://runkit.com/embed/gfk2ixcd5gbp

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->



**Validation result, data AFTER validation, error messages**

```
Error: no schema with key or ref "#/definitions/Data"
```

**What results did you expect?**

To find and validate the schema. __It works without the custom keyword__ (just remove addKeyword and it works as expected).


**Are you going to resolve the issue?**

I have no clue why is this happening and how to fix it.