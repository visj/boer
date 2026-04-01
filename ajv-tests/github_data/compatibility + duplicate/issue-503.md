# [503] url missing in dependencies

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

v5.1.3 (latest from npm)

**result **
The `url` dependency is missing from package.json. It's required in [/lib/compile/resolve.js](https://github.com/epoberezkin/ajv/blob/fde7030a19833273b08e8de879cb2bf149adaf2f/lib/compile/resolve.js)
