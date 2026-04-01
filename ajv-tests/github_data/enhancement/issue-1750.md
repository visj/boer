# [1750] Provide tested value itself as additional key in ErrorObject

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
8.6.2

**What problem do you want to solve?**
When browsing validation errors, I can see the path to mismatched value (instancePath), but not the value itself.
In my case (tested data is built dynamically), that prevents quick finding and fixing the problem.

**What do you think is the correct solution to problem?**
Provide additional key in ErrorObject, containing the tested value itself

**Will you be able to implement it?**
Unsure