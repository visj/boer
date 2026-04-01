# [1842] Should we let useDefaults 'empty' work on fields containing whitespaces after executing `trim` transform

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->
**What version of Ajv are you using?**
ajv@6.12.6
ajv-keywords@3.5.2

**What problem do you want to solve?**
I used `trim` transform to remove whitespaces and `useDefaults: 'empty'` and actually this didn't work for me

To reproduce: https://runkit.com/asaid-0/61b3e99224487e000899e8ee

**What do you think is the correct solution to problem?**
I don't know if this should be handled the way I think (execute the transform before adding the defaults) or it should be like this.

or maybe adding a new value for useDefaults like `useDefaults 'whitespaces'`

**Will you be able to implement it?**
Yes, maybe