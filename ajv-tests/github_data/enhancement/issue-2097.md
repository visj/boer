# [2097] Support for 'readyOnly'

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**

8.4.0

**What problem do you want to solve?**

json-schema has a `readOnly` property. This is _super handy_ because a really common use-case is for json-schema to describe an entity (lets say 'an article') and that schema to be re-used for both `GET` and `PUT` requests.

But if that schema has an `id` field, you kinda want to omit that on `PUT`. A different option to handle this is to have 2 schemas, or make `id` non-required, but the former is a pain to maintain, and the latter makes it somewhat inaccurate.

The `readOnly` annotation captures this use-case really well, so if there's a way we can tell Ajv: validate, but use the 'readOnly' case, it should remove those properties before validating.

**What do you think is the correct solution to problem?**

Not familiar enough with Ajv internals


**Will you be able to implement it?**

Unlikely =(