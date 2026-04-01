# [1287] Option to treat `null` as lack of value

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

Seems closely related to https://github.com/ajv-validator/ajv/issues/937

**What version of Ajv you are you using?**

v6.12.5

**What problem do you want to solve?**

In JavaScript, when processing configuration objects it's typical to treat _lack of value_, `null` and `undefined` as equal.

e.g. when one wants to override  `{ foo: "bar" }`, with `{ foo: null }`, it's clear that intention is to clear `foo` from object.

Currently schema validation will not accept `null` values for properties unless it's explicitly allowed in schema. Still allowing it for every configured property seems as very verbose and maintenance wise problematic practice.

_In my opinion if property is optional, `null` naturally should be supported as a valid value, per schema_

**What do you think is the correct solution to problem?**

Ideally, an option as `normalizeNoValues` that would treat _lack of value_, `null` and `undefined` as equal.

