# [1653] Validating multiple object schemas using oneOf

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->
Trying to validate a request body against two possible schemas. We want to validate data either against:
```
{
  specific: linksSchema,
  branch: linksSchema
}
```
OR
```
{
  linksSchema
}
```
We are currently using `oneOf` keyword (we could be using `anyOf` as well). We have chosen `oneOf` as we want to validate just one of the schemas in each validation process and we do not want to validate against more than one schema as `anyOf` offers.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
ajv@8.6.0


**Your code**
My code can be found here: https://runkit.com/guillempuig/60cc52a1973cdb001ad79da8
We are following the documentation in: https://ajv.js.org/json-schema.html#oneof & https://json-schema.org/understanding-json-schema/reference/combining.html#oneof

One case we are trying to validate is:
```
{ links: { applicable: [{ path: "1" }] } }
```

**Validation result, data AFTER validation, error messages**
From the schema definitions, we should get data validated, in this case, as we are matching the second json schema of the `oneOf` keyword. However, the output is:
```
[
  {
    instancePath: '/links',
    schemaPath: '#/properties/links/oneOf',
    keyword: 'oneOf',
    params: { passingSchemas: [Array] },
    message: 'must match exactly one schema in oneOf'
  }
]
```
Testing another data, exactly following one of the schemas, we get the same error
```
const body = { links: { applicable: [{ "path": "a" }], mandatory: [{ "path": "a" }], notApplicable: [{ "path": "a" }] } }
```

In addition, if replacing `oneOf` for `anyOf`, it validates the case presented before, but it validates wrong schemas as well. E.g.
```
{ links: { applicable: { path: "1" } } }
```
In this case, it should fail as `applicable` must be an array of objects, not an object.

Thanks for your help,