# [2310] Nullable doesn't cover unions with null in it

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

`8.12.0`

**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->

```typescript
export const UUID_PARAM: JSONSchemaType<{ uuid: string | null }> = {
    type: "object",
    additionalProperties: false,
    properties: {
        uuid: {
            nullable: true,
            type: "string",
            format: "uuid"
        }
    },
    required: [ "uuid" ]
};
```

**Typescript compiler error messages**

```
Type '{ type: "object"; additionalProperties: false; properties: { uuid: { nullable: true; type: "string"; format: string; }; }; required: "uuid"[]; }' is not assignable to type 'JSONSchemaType<{ uuid: string | null; }>'.
  The types of 'properties.uuid' are incompatible between these types.
    Type '{ nullable: true; type: "string"; format: string; }' is not assignable to type '{ $ref: string; } | ({ anyOf: readonly UncheckedJSONSchemaType<string | null, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<...> | undefined; definitions?: Record<...> | undefined; } & { ...; }) | ({ ...; } & ... 1 more ... & { ...; }) | ({ ...; } & ... 2...'.
      Types of property 'nullable' are incompatible.
        Type 'true' is not assignable to type 'false'.
```

**Describe the change that should be made to address the issue?**

Nullable should cover unions which include null.

**Are you going to resolve the issue?**

I would love for this to be resolved but I don't have enough experience with the internals of AJV to solve this type error myself. I would prefer it if someone who maintains this library would take a look at this.
