# [1031] proposal: coerceTypes from strings only

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**
6.10.0

**What problem do you want to solve?**
I want to convert values from queryStrings and url paramters into to their proper type. CoerceTypes `true` and `"array"` seem too eager to make changes I don't want such as converting `false` to `0` and vice versa.

**What do you think is the correct solution to problem?**
Add a new option for `coerceTypes`, maybe `"string"` or `"fromString"`.

**Will you be able to implement it?**
Probably not soon.