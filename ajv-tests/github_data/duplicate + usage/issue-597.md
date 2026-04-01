# [597] A question of instance configuration

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

Hi, thank you for this library! I'm curious can I override ajv instance options for different validate calls?
I.e. I wish to run `ajv.validate(schema, data1)` with instance `useDefaults: false` and 
`ajv.validate(schema, data2)` with instance `useDefaults: true` in different cases

Or I need to create new ajv instance for this purposes?