# [682] "Constant" does not seem to validate the same way as equivalent single-value enum

Please see the details in my StackOverflow question: https://stackoverflow.com/questions/48389997/json-schema-why-does-constant-not-validate-the-same-way-as-a-single-valued-e/

It's unclear why changing `{ "constant": "client" }` to `{ "enum": [ "client" ] }` affects the validation. Is that an error in my usage, or a bug in AJV? Thanks!

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.0.1


**Ajv options object**

Not sure. I'm using this via ajv-cli@3.0.0. I also tried with my own script, using AJV@6.0.1 directly, with no options, and received the same error.

**JSON Schema**

See https://stackoverflow.com/questions/48389997/json-schema-why-does-constant-not-validate-the-same-way-as-a-single-valued-e/

**Sample data**

See https://stackoverflow.com/questions/48389997/json-schema-why-does-constant-not-validate-the-same-way-as-a-single-valued-e/

**Your code**
N/A

**Validation result, data AFTER validation, error messages**

https://stackoverflow.com/questions/48389997/json-schema-why-does-constant-not-validate-the-same-way-as-a-single-valued-e/

**What results did you expect?**

I expected the sample data (two shown in the SO question) to be valid. However, both were invalid because the validator said that they matched both sub-schemas in the `oneOf` clause. I don't see how the sample documents would ever match both of the sub-schemas - they should only match one. When changing `{ "constant": "client" }` to `{ "enum": [ "client" ] }`, the validation worked as expected.

**Are you going to resolve the issue?**
