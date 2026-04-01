# [2081] Representing union type in schema

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.11

**Your typescript code**
<!--
Please make it as small as possible to reproduce the issue
-->

```typescript
type Typez = string | string[];
interface Test {
 typez: Types
}

const schema: JSONSchemaType<Test> = {
  type: "object",
  properties: {
    typez: {
      type: [{ type: "string"}, {type: "array", items: {type:"string"}}]
    }
  }
}


```

**Typescript compiler error messages**

```
Type '{ type: "object"; properties: { typez: { type: ({ type: string; } | { type: string; items: { type: string; }; })[]; }; }; }' is not assignable to type 'UncheckedJSONSchemaType<Test, false>'.
  The types of 'properties.typez' are incompatible between these types.
    Type '{ type: ({ type: string; } | { type: string; items: { type: string; }; })[]; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<Typez, false> & { const?: Typez | undefined; enum?: readonly Typez[] | undefined; default?: Typez | undefined; })'.
      Type '{ type: ({ type: string; } | { type: string; items: { type: string; }; })[]; }' is not assignable to type '{ type: "array"; items: UncheckedJSONSchemaType<string, false>; contains?: UncheckedPartialSchema<string> | undefined; minItems?: number | undefined; ... 4 more ...; additionalItems?: undefined; } & { ...; } & { ...; } & { ...; }'.
        Property 'items' is missing in type '{ type: ({ type: string; } | { type: string; items: { type: string; }; })[]; }' but required in type '{ type: "array"; items: UncheckedJSONSchemaType<string, false>; contains?: UncheckedPartialSchema<string> | undefined; minItems?: number | undefined; ... 4 more ...; additionalItems?: undefined; }'.ts(2322)

```

**Describe the change that should be made to address the issue?**
How shall I be able to represent the current type with ajv? 
I have not understood how this PR helped: https://github.com/ajv-validator/ajv/issues/1302
Or this: https://github.com/ajv-validator/ajv/issues/134

**Are you going to resolve the issue?**
I will resolve when I get some feedback
