# [1791] JTDSchemaType does not support empty form

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.6.3, yes

**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->

```typescript
type ParamType = string | number;

interface MyObj {
  name: string;
  param: ParamType;
}

// this works
const MyObjSchema1 = {
  properties: {
    name: { type: 'string' },
    params: {},
  },
};

// this fails
const MyObjSchema2: JTDSchemaType<MyObj> = {
  properties: {
    name: { type: 'string' },
    params: {},
  },
};
```

**Typescript compiler error messages**

```
TS2322: Type '{ name: { type: "string"; }; params: {}; }' is not assignable to type '{ name: JTDSchemaType<string, Record<string, never>>; param: never; }'.
  Object literal may only specify known properties, but 'params' does not exist in type '{ name: JTDSchemaType<string, Record<string, never>>; param: never; }'. Did you mean to write 'param'?
       properties: {
         name: { type: 'string' },
         params: {},
       },
     };
```

**Describe the change that should be made to address the issue?**

I am using Ajv with JTD schema to validate backend response data against a schema and the compatibility of used data transfer objects with said schema.
Ideally I would like to express the union type `ParamType` in the JTD schema, but I couldn't figure out how to do this and haven't found examples or workarounds.
As a next best option I tried to use the **empty form** for the `param` property. But when I type the schema as `JTDSchemaType<MyObj>` this gives a compiler error. But without `JTDSchemaType<MyObj>` I loose the integrity check of `MyObj` with the schema.
Admittedly I am a total noob on this matter. A good set of TypeScript examples how given objects map to JTDSchemas and how to use `JTDSchemaType` would be very helpful.

**Are you going to resolve the issue?**
no