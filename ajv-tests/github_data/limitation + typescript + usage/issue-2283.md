# [2283] JSONSchemaType fails wiht type when a field is declared nullable

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.12.0

**Ajv options object**

export const ajv = new Ajv({ strict: true })

I'm using Typescript

```typescript
interface MyType {
  id: string
  value: string | null
}

const MySchema: JSONSchemaType<MyType> = {
  type: "object",
  properties: {
    id: { type: "string" },
    value: { type: "string", nullable: true },
  },
}
export const validateMySchema = ajv.compile<MyType>(MySchema)
```

I'm getting this issue:

```
src/user/validation.ts:13:7 - error TS2322: Type '{ type: "object"; properties: { id: { type: "string"; }; value: { type: "string"; nullable: true; }; }; }' is not assignable to type 'JSONSchemaType<MyType>'.
  The types of 'properties.value' are incompatible between these types.
    Type '{ type: "string"; nullable: true; }' is not assignable to type '{ $ref: string; } | ({ anyOf: readonly UncheckedJSONSchemaType<string | null, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<...> | undefined; definitions?: Record<...> | undefined; } & { ...; }) | ({ ...; } & ... 1 more ... & { ...; }) | ({ ...; } & ... 2...'.
      Types of property 'nullable' are incompatible.
        Type 'true' is not assignable to type 'false'.

13 const MySchema: JSONSchemaType<MyType> = {
```

Also adding null as type:

```typescript
const MySchema: JSONSchemaType<MyType> = {
  type: "object",
  properties: {
    id: { type: "string" },
    value: { type: ["string", "null"], nullable: true },
  },
}
export const validateMySchema = ajv.compile<MyType>(MySchema)

```

I have the same error:

```
src/user/validation.ts:13:7 - error TS2322: Type '{ type: "object"; properties: { id: { type: "string"; }; value: { type: ("string" | "null")[]; nullable: true; }; }; }' is not assignable to type 'JSONSchemaType<MyType>'.
  The types of 'properties.value' are incompatible between these types.
    Type '{ type: ("string" | "null")[]; nullable: true; }' is not assignable to type '{ $ref: string; } | ({ anyOf: readonly UncheckedJSONSchemaType<string | null, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<...> | undefined; definitions?: Record<...> | undefined; } & { ...; }) | ({ ...; } & ... 1 more ... & { ...; }) | ({ ...; } & ... 2...'.
      Types of property 'nullable' are incompatible.
        Type 'true' is not assignable to type 'false'.

13 const MySchema: JSONSchemaType<MyType> = {
```

also removing the `nullable`, same issue:

```typescript
const MySchema: JSONSchemaType<MyType> = {
  type: "object",
  properties: {
    id: { type: "string" },
    value: { type: ["string", "null"] },
  },
}
export const validateMySchema = ajv.compile<MyType>(MySchema)
```


```
Type '{ type: "object"; properties: { id: { type: "string"; }; value: { type: ("string" | "null")[]; }; }; }' is not assignable to type 'JSONSchemaType<MyType>'.
  The types of 'properties.value' are incompatible between these types.
    Type '{ type: ("string" | "null")[]; }' is not assignable to type '{ $ref: string; } | ({ anyOf: readonly UncheckedJSONSchemaType<string | null, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<...> | undefined; definitions?: Record<...> | undefined; } & { ...; }) | ({ ...; } & ... 1 more ... & { ...; }) | ({ ...; } & ... 2...'.
      Type '{ type: ("string" | "null")[]; }' is not assignable to type '{ type: "string"; } & StringKeywords & { allOf?: readonly UncheckedPartialSchema<string | null>[] | undefined; anyOf?: readonly UncheckedPartialSchema<string | null>[] | undefined; ... 4 more ...; not?: UncheckedPartialSchema<...> | undefined; } & { ...; } & { ...; }'.
        Type '{ type: ("string" | "null")[]; }' is not assignable to type '{ type: "string"; }'.
          Types of property 'type' are incompatible.
            Type '("string" | "null")[]' is not assignable to type '"string"'.

13 const MySchema: JSONSchemaType<MyType> = {

```