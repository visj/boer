# [1986] TypeScript - enum definition issue

Ajv ver: 8.9.0

I want to use enum into my code but cannot define schema in the correct way. From my point of view everything is correct...
Yes, I can change 'enum' to
type TestType = 'http' | 'e2e';
but it less useful in my opinion.

It looks like issue with JSONSchemaType but I not sure.
Any suggestions?

Code:

```typescript
export enum TestType {
  E2E = 'e2e',
  HTTP = 'http',
}

export interface HTTPTest {
  type: TestType;
}

export const httpTestConfigSchema: ajvCommon.JSONSchemaType<HTTPTest> = {
  $id: 'httpTestConfigSchema',
  type: 'object',
  required: ['type'],
  additionalProperties: false,
  properties: {
    type: {
      type: 'string',
      enum: ['http'],
    },
  },
};

```

Error message:

```
Type '{ $id: string; type: "object"; required: "type"[]; additionalProperties: false; properties: { type: { type: "string"; enum: "http"[]; }; }; }' is not assignable to type 'UncheckedJSONSchemaType<HTTPTest, false>'.
  The types of 'properties.type' are incompatible between these types.
    Type '{ type: "string"; enum: "http"[]; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<TestType, false> & { const?: TestType | undefined; enum?: readonly TestType[] | undefined; default?: TestType | undefined; })'.
      Types of property 'enum' are incompatible.
        Type '"http"[]' is not assignable to type 'readonly TestType[]'.
          Type '"http"' is not assignable to type 'TestType'.ts(2322)
```

UPDATE
Solution:
instead of: enum: ['http'],
correct: enum: [ TestType.HTTP]