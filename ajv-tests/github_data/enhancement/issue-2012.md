# [2012] Specify maximum errors

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**

6.12.3

**What problem do you want to solve?**

We recently received a CodeQL security vulnerability relating to setting `allErrors: true` in AJV because this can cause resource exhaustion if a nefarious payload is provided.

It would be ideal to be able to specify a specific upper limit of errors before validation is exited. Otherwise, we have to specify `allErrors: false` and users have to continually re-submit their payloads because only one errors is returned at a time, which is a poor user experience.

It would be best if we can specify an upper limit (like 1000 errors) so that users can recieve more than one error at a time, and we ensure that a resource exhaustion attack is mitigated based on the available hardware. 

**What do you think is the correct solution to problem?**

Add a new property to Ajv options that specifies the maximum number of errors allowed, and then use that in the validation function to return early once reached.

**Will you be able to implement it?**

Yes, if I can get some guidance on where this validation takes place.
