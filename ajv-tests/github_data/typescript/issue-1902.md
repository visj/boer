# [1902] What needs to happen before we can get simultaneous TS inference and validation for JTD schemas?

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8

The last I've seen of work on the `JTDSchemaType` and `JTDDataType` is in https://github.com/ajv-validator/ajv/issues/1489
But the docs still say 

> type inference is not supported for JTDDataType yet
-[utility-type-for-jtd-data-type](https://ajv.js.org/guide/typescript.html#utility-type-for-jtd-data-type)

**For example, something like**

```typescript
function helper<T extends JTDSchemaType>(schema: T) {return schema};
const mySchema = helper({
  properties: {
    num: {type: "float64"},
    nullableEnum: {enum: ["v1.0", "v1.2"], nullable: true},
    values: {values: {type: "int32"}},
  },
  optionalProperties: {
    optionalStr: {type: "string"},
  },
  invalidKey: something // <-- invalid provides an inferred type error in your IDE
})
// And still be able to get inferred data type when the schema is type validated
const data = ajv.compile(mySchema)
let num = data.num // inferred to be number
```
