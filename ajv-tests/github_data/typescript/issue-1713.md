# [1713] Types of properties unknown using JTDDataType with 2020-12 $defs

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
 
`8.6.2`

**Description**

Defining a schema with [2020-12](https://json-schema.org/draft/2020-12/json-schema-validation.html) "$defs" instead of "definitions" key will result in types being unknown.

**Describe the change that should be made to address the issue?**

Use $defs field instead of definitions for the following type:
```
export type JTDDataType<S> = S extends {definitions: Record<string, unknown>}
  ? JTDDataDef<S, S["definitions"]>
  : JTDDataDef<S, Record<string, never>>
```
This may need to be seperate and exported as part of 2020

**Are you going to resolve the issue?**

Happy to help if required
