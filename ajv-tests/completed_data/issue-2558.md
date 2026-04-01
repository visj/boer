# [2558] JSONSchemaType with TypeScript is broken

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.17.1

**TypeScript version**

5.8.3

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
// none
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

For the bug report, I used the JSON from the documentation https://ajv.js.org/guide/typescript.html#utility-types-for-schemas

```json
{
    "type": "object",
    "properties": {
        "foo": { "type": "integer" },
        "bar": { "type": "string", "nullable": true }
    },
    "required": ["foo"],
    "additionalProperties": false
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

It's only about typing.

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

It's similar to the code in the documentation  https://ajv.js.org/guide/typescript.html#utility-types-for-schemas, except that the JSON string is not written as string literal as part of the initialization, but separately

```typescript
const schemaFromObject = {
        "type": "object",
        "properties": {
            "foo": { "type": "integer" },
            "bar": { "type": "string", "nullable": true }
        },
        "required": ["foo"],
        "additionalProperties": false
    }
const schema: JSONSchemaType<MyData> = schemaFromObject;
```

I also have variants reading the JSON from other files etc., which are also not working. But this is the smallest change compared to the documentation.

**Expected Result**

This code should work similar to https://ajv.js.org/guide/typescript.html#utility-types-for-schemas

**Actual Result**

A type error is emitted (by tsc):

```markdown
Type '{ type: string; properties: { foo: { type: string; }; bar: { type: string; nullable: boolean; }; }; required: string[]; additionalProperties: boolean; }' is not assignable to type 'JSONSchemaType<MyData>'.
  Type '{ type: string; properties: { foo: { type: string; }; bar: { type: string; nullable: boolean; }; }; required: string[]; additionalProperties: boolean; }' is not assignable to type '({ anyOf: readonly UncheckedJSONSchemaType<MyData, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<...>> | undefined; definitions?: Record<...> | undefined; }) | ({ ...; } & { ...; })'.
    Type '{ type: string; properties: { foo: { type: string; }; bar: { type: string; nullable: boolean; }; }; required: string[]; additionalProperties: boolean; }' is not assignable to type '{ oneOf: readonly UncheckedJSONSchemaType<MyData, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<...>> | undefined; definitions?: Record<...> | undefined; }'.
      Property 'oneOf' is missing in type '{ type: string; properties: { foo: { type: string; }; bar: { type: string; nullable: boolean; }; }; required: string[]; additionalProperties: boolean; }' but required in type '{ oneOf: readonly UncheckedJSONSchemaType<MyData, false>[]; }'.ts(2322)
json-schema.d.ts(25, 5): 'oneOf' is declared here.
---
const schema: JSONSchemaType<MyData>
```

**Remarks**

There are a lot of related reports, here is only a list of some of them:
- #2521
- #2518
- #2283
- #2227
- #2043
- #2040
- #1988
- #1845
- #1664
- #1521

While one can argue in some cases that the schema has to be defined differently, I would say due to the large number of reports and even the example in the documentation failing, there is a fundamental problem in the type definition somewhere.

Fortunately there is a simple workaround:
```typescript
const schema = schemaFromObject  as JSONSchemaType<MyData>;
```
Of course, this does not check the schema at all.