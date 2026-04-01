# [1521] JSONSchemaType requires "required" and "additionalProperties", unless it is oneOf schema

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.0.1, yes

**Ajv options object**

```javascript
{}
```

**Your code**
```typescript
type Test = {
  some: string;
  other: boolean;
};

const t: JSONSchemaType<Test> = {
  type: 'object',
  properties: {
    other: {
      type: 'boolean',
    },
    some: {
      type: 'string',
    },
  },
};
```

**What results did you expect?**
Should be a valid type, instead the compiler throws

`TS2322: Type '{ type: "object"; properties: { other: { type: "boolean"; }; some: { type: "string"; }; }; }' is not assignable to type 'JSONSchemaType<test, false>'.   Type '{ type: "object"; properties: { other: { type: "boolean"; }; some: { type: "string"; }; }; }' is not assignable to type '{ oneOf: readonly JSONSchemaType<test, false>[]; } & { [keyword: string]: any; $id?: string; $ref?: string; $defs?: { [x: string]: JSONSchemaType<Known, true>; }; definitions?: { ...; }; }'.     Property 'oneOf' is missing in type '{ type: "object"; properties: { other: { type: "boolean"; }; some: { type: "string"; }; }; }' but required in type '{ oneOf: readonly JSONSchemaType<test, false>[]; }'`
