# [1969] Apply Trim To Generated String Data

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?** 
6.12.0

**What problem do you want to solve?**
My team uses AJV to generate mock data for the purposes of testing VueJS components.  We build complex schema files that generate mock data that matches our api responses.  Those schema files are processed by code that transforms them into generator methods that allow for things like overriding individual properties in the generated data.  Once generated we pass the data to our VueJS components and write assertions to confirm the components are working as intended.

Some of our tests, that assert on the generated "string" data, randomly fail due to extra whitespace before and after the generated strings. This is occurring because the default behavior of HTML is to trim the whitespace from any strings inserted into the templates.  Once trimmed, the strings pulled from the templates, in the mounted components, do not match the strings in the "expect" statements of our tests.

**What do you think is the correct solution to problem?**
So AJV takes JSON schema definitions and translates them into mock data right?  My proposed solution is to trim the excess whitespace from that generated data before returning it.

**Will you be able to implement it?**
I haven't looked into the AJV codebase yet but if it is possible to solve this within your codebase then I am confident that I could do it.