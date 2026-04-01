# [2040] Typescript undefined type is not supported by schema type utilities

When trying to define a Schema where one property is optional (undefined) and not `null` in Typescript I'm getting type errors and cannot build the typescript. I know the error states " 'nullable' is missing in type" and I have no interest treating null and undefined the same, I want only the object to be valid if it has the property of type string or not defined in the object so that is in line white the Typescript object.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

v8.11.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```typescript
  interface TheType {
    key2: string | undefined;
  }
  const schema: JSONSchemaType<TheType> = {
    additionalProperties: true,
    required: [],
    properties: {
      key2: { type: "string" },
    },
    type: "object",
  }
```

**The error**

<!-- Please make it as small as possible to reproduce the issue -->

```
Type '{ additionalProperties: true; required: never[]; properties: 
  { key2: { type: "string"; }; }; type: "object"; }' is not assignable to 
  type 'UncheckedJSONSchemaType<TheType, false>'.
The types of 'properties.key2' are incompatible between these types.
Type '{ type: "string"; }' is not assignable to type '{ $ref: string; } 
  | (UncheckedJSONSchemaType<string | undefined, false> 
  & { nullable: true; const?: null | undefined; 
  enum?: readonly (string | null | undefined)[] 
  | undefined; default?: string | ... 1 more ... | undefined; })'.
  Type '{ type: "string"; }' is not assignable to type '{ type: "string"; } 
  & StringKeywords & { 
  allOf?: readonly UncheckedPartialSchema<string | undefined>[] 
  | undefined; anyOf?: readonly UncheckedPartialSchema<string | undefined>[] 
  | undefined; ... 4 more ...; not?: UncheckedPartialSchema<...> 
  | undefined; } & { ...; } & { ...; }'.
Property 'nullable' is missing in type '{ type: "string"; }' 
but required in type '{ nullable: true; const?: null | undefined; 
enum?: readonly (string | null | undefined)[] 
| undefined; default?: string | null | undefined; }'.
```

** **

```typescript
  interface TheType {
    key2: string | undefined;
  }
  const schema: JSONSchemaType<TheType> = {
    additionalProperties: true,
    required: [],
    properties: {
      key2: { nullable: false, type: "string" },
    },
    type: "object",
  }
```

**The error**

```
Type '{ additionalProperties: true; required: never[]; properties: { key2: { 
nullable: false; type: "string"; }; }; type: "object"; }' 
is not assignable to type 'UncheckedJSONSchemaType<TheType, false>'.
The types of 'properties.key2' are incompatible between these types.
  Type '{ nullable: false; type: "string"; }' is not assignable to 
  type '{ $ref: string; } | (UncheckedJSONSchemaType<string | undefined, false> 
  & { nullable: true; const?: null | undefined; 
  enum?: readonly (string | null | undefined)[] | undefined; 
  default?: string | ... 1 more ... | undefined; })'.
Types of property 'nullable' are incompatible.
Type 'false' is not assignable to type 'true'.

```