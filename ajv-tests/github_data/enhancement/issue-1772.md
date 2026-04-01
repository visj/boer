# [1772] Add metadata annotations to UncheckedJSONSchemaType

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
8.6.3

**What problem do you want to solve?**
The `JSONSchemaType` does not check the types of [metadata annotations](https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#page-23).

This means that incorrect types can be assigned to keywords, which will then fail validation at runtime when compiled by Ajv. 

e.g.
```ts
const testSchema: JSONSchemaType<{}> = { description: 4 }
```
This is valid for `JSONSchemaType`, despite it being invalid per the spec, as `description` must be a `string`.

The fact that these keywords are not typed seems inconsistent with the approach to other keywords in the validation spec (e.g. `minLength`), which are typed.

**What do you think is the correct solution to problem?**
Add the following to `UncheckedJSONSchemaType` - either after `$defs`, `definitions` etc, or by adding a new `MetadataKeywords` type:

```ts
{
    default?: any;
    description?: string;
    examples?: any[];
    readOnly?: boolean;
    title?: string;
    writeOnly?: boolean;
}
```
Notes on this:
1. `deprecated` is omitted as it was added in 2019-09 (not sure if this type is supposed to capture post-07 things or not)
2. unrestricted values are typed as `any`, which permits invalid JSON values, but is the approach taken elsewhere in the types for unrestricted values.

**Will you be able to implement it?**
Yes.