# [2198] Ignore all unknown format in v8 (unknownFormats: 'ignore')

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports. For other issues please use:
- security vulnerability: https://tidelift.com/security)
- a new feature/improvement: https://ajv.js.org/contributing/#changes
- browser/compatibility issues: https://ajv.js.org/contributing/#compatibility
- JSON-Schema standard: https://ajv.js.org/contributing/#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.12.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

Default

**Issue**


I'm currently upgrading one my project from using ajv v6 to ajv v8
I would like to keep all functionalities as close as possible as what we have right now 

One of them is to ignore all unknown formats from the schema 

From the documentation from the v8 I don't see a way to mimic the  `unknownFormats: 'ignore'` option anymore

I can only see that we can whitelist a specific format or just disable all format validation at once

But since I don't have control about how format are provided on schemas that I will compile, I reallly need a way to ignore unknown format while still being able to validate known ones

Is it something that is possible in v8 ? 
