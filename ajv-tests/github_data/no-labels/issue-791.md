# [791] Support "format" based validation for utf-8/international emails

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**
6.1.0

**What problem do you want to solve?**
Due to the RFC 3490 (http://www.faqs.org/rfcs/rfc3490.html) about internationalization of emails, which allows foreign language characters in email addresses (e.g.: é, п, 정), we are seeing a high volume of users in our databases with these email addresses. But our validations are rejecting these email addresses if we use ajv's `"format": "email"` feature.

**What do you think is the correct solution to problem?**
Adding an optional parameter/option for utf-8 email validation, maybe something like `"format": "email", "allow-utf": true` and the value would be false by default for efficiency.

**Will you be able to implement it?**
No :(