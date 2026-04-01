# [1830] Please document if/how standalone validation code generation can be run by Webpack

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
8.8.2

**What problem do you want to solve?**
Get rid of 'unsafe-eval' in our CSP by using standalone validation code.

**What do you think is the correct solution to problem?**
Let Webpack generate the standalone validation code on build.

**Will you be able to implement it?**
Sadly no.