# [927] useDefaults: 'empty' for undefined values

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**
6.7.0
**What problem do you want to solve?**
According to the readme doc `With the option value "empty" properties and items equal to null or "" (empty string) will be considered missing and assigned defaults.` useDefaults: 'empty' should work only if value is `''` or `null`, but ajv creates a field/value even if in source object particular field does not exists
**What do you think is the correct solution to problem?**
do not create default value for undefined fields.