# [2170]  removeAdditional: 'failing' and `injectAdditionalProperties`

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**

8.11.2

**What problem do you want to solve?**

I want to do one-off enforcement checks of `additionalProperties` as though it exists on all objects without imposing the schema requirement on all users. My own demo schemas should not have additional properties, but I am not inclined to impose this on users.

**What do you think is the correct solution to problem?**

Add an option to `removeAdditional` or an option in conjunction with `removeAdditional`

**Will you be able to implement it?**

No.