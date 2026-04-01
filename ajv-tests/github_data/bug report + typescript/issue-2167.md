# [2167] Type of sibling property of a ref property is unknown when validated via JTDSchemaType

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.11.2 (latest as of this writing)

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```ts
import Ajv, { JTDSchemaType } from "ajv/dist/jtd";
const ajv = new Ajv();
```

**JTD Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```ts
type MyType = {
  referenced: number;
  stringProp: string;
};

const schema: JTDSchemaType<MyType, { num: number }> = {
  definitions: {
    num: { type: "int32" }
  },
  properties: {
    referenced: { ref: "num" },
    stringProp: { type: "string" }
  }
} as const;

```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```ts
const data = {} as any;
```

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

```ts
const validate = ajv.compile(schema);

if (validate(data)) {
  const revealType: never = data;
  const stringProp: string = data.stringProp;
  console.log(stringProp);
}
```

https://replit.com/@ento/IntrepidIndolentOutput#index.ts

^`strictNullChecks` is enabled in `tsconfig.json`

```json
		"strictNullChecks": true, 
```

**Validation result, data AFTER validation, error messages**

TypeScript's typecheck errors:

```
// const revealType
Type '{ referenced: number; stringProp: unknown; } & {}' is not assignable to type 'never'.

// const stringProp
Type 'unknown' is not assignable to type 'string'.
```

**What results did you expect?**

The type of `stringProp` to be `string` after being narrowed by `validate(data)` 

**Are you going to resolve the issue?**

My current workaround is to hold the definition in a const and use it to compose the schema object. (The actual code is a bit more complex than this.)

```ts
const numSchema = { type: "int32" } as const;

const schema: JTDSchemaType<MyType> = {
  properties: {
    referenced: numSchema,
    stringProp: { type: "string" }
  }
} as const;
```