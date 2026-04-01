# [1543] JTD timestamp validation option - string/date/either


<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
8.0.5

**What problem do you want to solve?**
The JTD timestamp type [currently accepts](https://ajv.js.org/json-type-definition.html#type-form) both Date objects and properly-formatted strings. I'd like to be able to restrict this to just Dates. 

**What do you think is the correct solution to problem?**
Perhaps a new [option](https://ajv.js.org/options.html#options-to-modify-validated-data)?

Something like
```ts
type JtdTimestampOption = "dateObject" | "isoString" | "both";

// then add to JTDOptions e.g.:
timestampAccepts?: JtdTimestampOption
```

With a default of "both".

**Will you be able to implement it?**

I think so.

--------

Related: https://github.com/ajv-validator/ajv-keywords/issues/166