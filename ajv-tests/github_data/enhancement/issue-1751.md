# [1751] Validate against a definition

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**

8.6.2

**What problem do you want to solve?**

I have lots of mutually recursive types. I use `typescript-json-schema` to generate json schema for validation. They give me two options, either generating a single schema with all types included as definitions or a separate schema for each type where referenced types are redundantly included in each schema. I go for option #1 for resource efficiency. But I can't find any way to have ajv to choose a reference from my schema and validate data against it.

**What do you think is the correct solution to problem?**

I think it would be efficient and technically feasible to add an option to the function returned by `ajv.compile` so that I could specify one of the definitions to validate my data against. I could still use the main entry as the default choice when the option is omitted.

**Will you be able to implement it?**

Not in the near future.
