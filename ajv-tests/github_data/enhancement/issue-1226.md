# [1226] validate examples keyword content

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**

- **ajv**: `6.12.2`
- **ajv-cli**: `3.2.1`,

**What problem do you want to solve?**

JSON Schema **draft-06** added `examples` keyword.
I would like to validate it's contents.

- https://json-schema.org/draft-06/json-schema-release-notes.html
- https://json-schema.org/draft/2019-09/json-schema-validation.html#rfc.section.9.5

Currently these instances are not validated:

> Ajv does not check the validity of these instances against the schema.
> https://github.com/ajv-validator/ajv#annotation-keywords

**What do you think is the correct solution to problem?**

An opt-in API and a CLI option to validate all examples.
It should iterate over each item and run validation as always.

**Will you be able to implement it?**

Fair question. I need to check.