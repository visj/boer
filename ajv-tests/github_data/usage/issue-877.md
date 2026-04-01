# [877] relative $ref not resolving

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
6.5.4
When trying to resolved relative $ref, the algorythm returns there error:
```
MissingRefError: can't resolve reference identifier_info_schema.json# from id https://w3id.org/dats/schema/person_schema.json#
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->
see: https://raw.githubusercontent.com/datatagsuite/schema/master/person_schema.json
the json input being a bit big, i don't want to overflow this thread


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->
code is available here: https://runkit.com/terazus/5bdb2df069012300129cdc73


I'm either doing something wrong in my code, or in my schemas, i guess.

Ty
