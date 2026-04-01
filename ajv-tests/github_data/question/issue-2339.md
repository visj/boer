# [2339] [Q] Recommendations for Converting JSON Schema to TS Types in Ajv?

How can I convert my predefined JSON Schema files into TS Types as a developer? I've looked into:

1. [json-schema-to-typescript](https://github.com/bcherny/json-schema-to-typescript)
   - Pros: Overall good output.
   - Cons: 
     - Produces empty interface for `patternProperties`.
     - Issues with duplicate type outputs and can't see all the schemas to minimize duplicates.
2. [json-schema-to-ts](https://github.com/ThomasAribart/json-schema-to-ts)
   - Pros: Good output for simple schemas and fast.
   - Cons: Problem resolving definitions in referenced schemas ([issue #172](https://github.com/ThomasAribart/json-schema-to-ts/issues/172)).

I thought Ajv, being a prominent tool for validation, might have tools for this, but I've only found [limited support for type inferring with JTD schemas](https://ajv.js.org/guide/typescript.html#utility-type-for-jtd-data-type) and no support for type generation for JSON Schema. Does the Ajv community recommend any tools for this purpose, or is there an in-built tool in Ajv that I might have missed?