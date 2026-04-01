# [2249] If coercion fails, replace value with null and don't raise error

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**

v8.12.0

**What problem do you want to solve?**

I rarely want validation to fail, as I am using ajv more as a schema-driven transformation tool, and some errors occurring in parts of the tree of data are okay. e.g. Failing `required` should raise an error, but if a type coercion (eg. 'abc' -> number) doesn't work then in that specific case I'd rather just replace the value with null

The original plan was to use `allErrors` and then in the output, find type errors and use the path to update the data (replace 'abc' with null)... however I do make use of `allOf`, and when there is a failed type validation in an object property, the whole object is coming back as an empty object.


**What do you think is the correct solution to problem?**

Make the codegen component configurable. Specifically here, I'd like to replace the value with null instead of reporting the type error:

https://github.com/ajv-validator/ajv/blob/325ac9a6396baed3eaf588ee80aed3b1f23d12dd/lib/compile/validate/dataType.ts#L81

**Will you be able to implement it?**

I could try, for now I might try to monkey patch the library at runtime or use the [patch-package](https://www.npmjs.com/package/patch-package) library. Thought I would raise an issue first to see if you had any other suggestions
