# [2129] Extract Schema types to separate Repo

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
AJV-8

**What problem do you want to solve?**
I am a contributor to [React JSON Schema Form](https://github.com/rjsf-team/react-jsonschema-form) and we have a situation where we are using either AJV 6 or 8 in different circumstances. We are currently using `@types/json-schema` for the JSONSchema7 definition. We are wanting to be able to use the schema types from AJV in our Repos without pulling the whole of the AJV implementation

**What do you think is the correct solution to problem?**

Extract the Typescript definitions for Schemas (for JSONSchema7, 2019, 2020) into a new repo (e.g. ajv-schema-types, ajv-json-schemas or ajv-types) so that it can be imported without the overhead of the implementations

**Will you be able to implement it?**
Possibly