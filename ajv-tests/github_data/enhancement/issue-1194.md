# [1194] Pass schema to processCode

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**

6.12.0

**What problem do you want to solve?**

I am using the `processCode` option to instrument my generated code and it would be useful for my instrumentation to have access to information from my schemas.

**What do you think is the correct solution to problem?**

I think the schema should be passed as a second parameter to the `processCode` function.

**Will you be able to implement it?**

Yes.
