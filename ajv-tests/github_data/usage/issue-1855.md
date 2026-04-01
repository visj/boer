# [1855] Include actual schema reference in error object?

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
8.8.2

**What problem do you want to solve?**
In order to provide good error messages in our use case (an IDE), we significantly postprocess the errors from ajv. That currently requires accurate `instancePath` and `schemaPath` values. Unfortunately, it seems that accurate `schemaPath` information is hard to do in the current set up, as indicated by issues #1662 and #516.

Specifically, it seems that schema references and `allOf` schemas do not track `schemaPath` information accurately, as can be seen by inspecting the generated code in the repro here https://runkit.com/cscheid/ajv-schema-path-allof-ref/0.0.1 .

For my use case, the only reason I need `schemaPath` is so I can navigate the schemas from the schema which I called the validation function to the schema that emitted the error. However, it seems that most of the error code generation has access to the relevant schema (`enum`, for example, passes additional parameters to the error object that have to do with the allowable values, and it does so by direct reference to the schema).

**What do you think is the correct solution to problem?**
If it were possible to include the actual schema in the `params` object, then I would no longer need accurate schemaPaths, and I would still be able to generate good error messages.

**Will you be able to implement it?**
I will work on a PR.
