# [2163] JSONSchemaType doesn't infer nullable types 

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.11.2 
This issue is not present in 8.11.0

**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->

```typescript
import { JSONSchemaType } from "ajv";

const schema: JSONSchemaType<{ foo: string | null }> = {
	type: "object",
	properties: {
		foo: { type: "string", nullable: true },
	},
	required: ["foo"],
};

void schema;
```

**Typescript compiler error messages**

```
Type '{ type: "object"; properties: { foo: { type: "string"; nullable: true; }; }; required: "foo"[]; }' is not assignable to type 'UncheckedJSONSchemaType<{ foo: string | null; }, false>'.
  The types of 'properties.foo' are incompatible between these types.
    Type '{ type: "string"; nullable: true; }' is not assignable to type '{ $ref: string; } | ({ anyOf: readonly UncheckedJSONSchemaType<string | null, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<...> | undefined; definitions?: Record<...> | undefined; } & { ...; }) | ({ ...; } & ... 1 more ... & { ...; }) | ({ ...; } & ... 2...'.
      Types of property 'nullable' are incompatible.
        Type 'true' is not assignable to type 'false'.ts(2322)
```

**Describe the change that should be made to address the issue?**
There should be no TypeScript errors. As mentioned, this does not give any compiler errors in version 8.11.0

**Are you going to resolve the issue?**
I'm not familiar with the internals of ajv