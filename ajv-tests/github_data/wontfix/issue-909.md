# [909] Set `mode` to handle `readOnly` and `writeOnly`

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**
6.6.2

**What problem do you want to solve?**
I want to use the same schema for request and response by leveraging `readOnly`and `writeOnly` properties.

**What do you think is the correct solution to problem?**
One possible solution would be to add new configuration option `mode` that would set `Ajv` mode to either `DEFAULT` (like it works now) or `READ`(in this mode all `readOnly` items should be taken into account) or `WRITE`(should validate `writeOnly` stuff)

**Will you be able to implement it?**
Probably