# [2328] Coercion support for JTD

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**

v8.12.0

**What problem do you want to solve?**

Currently AJV doesn't support the `coerceTypes` option when using JSON type definitions. When you import from `ajv/dist/jdt` and try to pass `coerceTypes` to the constructor you get a "not assignable to undefined" type error.

![image](https://github.com/ajv-validator/ajv/assets/31548851/0779cf5d-087f-4c81-adb2-fd234ebf3f8f)

**What do you think is the correct solution to problem?**

I think it would be good to implement support for this since it is already supported when using JSON schemas. A simple use case is coercing the values from url query parameters.

**Will you be able to implement it?**

Probably not.