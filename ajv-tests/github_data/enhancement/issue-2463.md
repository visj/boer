# [2463] Add `validateSchema` "strict" mode

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
`8.12.0`

**What problem do you want to solve?**
We have a server-side "repository" of schemas that we lazy-compile (and cache) only when they are really used. When adding a new schema to the repository the JSON payload is validated using the `validateSchema` function. My assumption was that if the schema is valid then the `compile` function should always work. However, this is not true if you enable the strict mode (which is enabled by default). 

**What do you think is the correct solution to problem?**
I would like to have a function (or an additional option in the `validateSchema`) that can assure that the compile function will return the validate function. 

**Will you be able to implement it?**
I've looked into the inner workings of avj in the past, I might know the places to touch but I probably need some guidance. 
