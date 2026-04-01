# [1073] proposal: Show titles in error messages for subschema of allOf/anyOf/oneOf

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**
6.10.2 (dependency of ajv-cli)

**What problem do you want to solve?**
Make it easier to debug allOf/anyOf/oneOf with lots of subschema.

**What do you think is the correct solution to problem?**
If a subschema includes a title propery, include that in the error message.

**Will you be able to implement it?**
No. Looked at code, but have no idea where this would be implemented.
