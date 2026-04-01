# [2082] Unknown attributes AJV and typescript

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
    typez: Typez,
    [otherAttributes: string]: any;
  }

  const schema2: JSONSchemaType<Test> = {
    type: "object",
    properties: {
      typez: {
        anyOf: [{ type: "string"}, {type: "array", items: {type:"string"}}],
      }
    },
    additionalProperties: true,
    required:["typez"]
  }
  console.log(schema2)
}


```

**Typescript compiler error messages**

```
Type '{ type: "object"; properties: { typez: { anyOf: ({ type: "string"; } | { type: "array"; items: { type: "string"; }; })[]; }; }; additionalProperties: true; required: string[]; }' is not assignable to type 'UncheckedJSONSchemaType<Test, false>'.
  Types of property 'properties' are incompatible.
    Type '{ typez: { anyOf: ({ type: "string"; } | { type: "array"; items: { type: "string"; }; })[]; }; }' is not assignable to type 'UncheckedPropertiesSchema<Test>'.
      Property 'typez' is incompatible with index signature.
        Type '{ anyOf: ({ type: "string"; } | { type: "array"; items: { type: "string"; }; })[]; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<any, false> & { nullable: true; const?: null | undefined; enum?: readonly any[] | undefined; default?: any; })'.
          Type '{ anyOf: ({ type: "string"; } | { type: "array"; items: { type: "string"; }; })[]; }' is not assignable to type '{ type: "null"; nullable: true; } & { allOf?: readonly UncheckedPartialSchema<any>[] | undefined; anyOf?: readonly UncheckedPartialSchema<any>[] | undefined; ... 4 more ...; not?: UncheckedPartialSchema<...> | undefined; } & { ...; } & { ...; }'.
            Type '{ anyOf: ({ type: "string"; } | { type: "array"; items: { type: "string"; }; })[]; }' is missing the following properties from type '{ type: "null"; nullable: true; }': type, nullablets(2322)

```

**Describe the change that should be made to address the issue?**
How shall I be able to represent the current type with ajv? 
I did not find a solution in this issue: https://github.com/ajv-validator/ajv/issues/1521

**Are you going to resolve the issue?**
I will resolve when I get some feedback
