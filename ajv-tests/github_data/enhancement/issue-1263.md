# [1263] Improve schema validation

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**

6.12.4

**What problem do you want to solve?**

When defining schema I've put `requiredProperties` instead of `required` on object definition, and it went unnoticed as valid schema

**What do you think is the correct solution to problem?**

As I have `validateSchema: true` I'd expect _unexpected property_ error to  be thrown

**Will you be able to implement it?**

No