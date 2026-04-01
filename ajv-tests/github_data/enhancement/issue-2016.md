# [2016] Async validation

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?
8.11

**What problem do you want to solve?**
Async validation of one field using the value of other field and making async call and validate the data.

**What do you think is the correct solution to problem?**
I have implemented same using yup validation schema using when api, in which i got the value of country field and using that country value , I was able to validate services field for that country by async call to server.

**Will you be able to implement it?**
