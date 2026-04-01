# [2265] vscode intellisense for prefixItems

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
version : 8.12.0

**Typescript code**

```typescript
interface Data {
  hobbies: string[];
}

const schema: JSONSchemaType<Data> = {
  type: "object",
  properties: {
    hobbies: {
      type: "array",
      uniqueItems: true,
      prefiexItems: [
        { type: "string" },
        { type: "string" },
        { type: "string" },
        { type: "string" },
      ],
      items: false,
    },
  },
};
```

**Typescript compiler error messages**

```
The types of 'properties.hobbies' are incompatible between these types.
    Type '{ type: "array"; uniqueItems: true; prefiexItems: { type: string; }[]; items: boolean; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<string[], false> & { nullable?: false | undefined; const?: string[] | undefined; enum?: readonly string[][] | undefined; default?: string[] | undefined; })'.
      Types of property 'items' are incompatible.
        Type 'boolean' is not assignable to type 'UncheckedJSONSchemaType<string, false>'.ts(2322)
```

**Describe the change that should be made to address the issue?**
As from [NEW: draft 2020-12](https://ajv.js.org/json-schema.html#prefixitems) prefixItems is new addition and [additionalItems is not supported in JSON Schema draft-2020-12](https://ajv.js.org/json-schema.html#additionalitems) i want to disable additional items but vscode does not provide intellisense for `prefixItem`

**Are you going to resolve the issue?**
no