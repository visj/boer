# [1491] JSONSchemaType support for Record

**Version**
v8

**Problem**
Currently JSONSchemaType does not support types like `Record<string, T | undefined>` (or `{[K in string]?: T}`).

**Solution**

For the type for example:

```typescript
type MyRecord = Record<string, number | undefined>
```

JSONSchema should be:

```typescript
const myRecordSchema: JSONSchemaType<MyRecord> = {
  type: "object"
  additionalProperty: {type: "number"}
}
```

It should also allow `propertyName` keyword.

Possibly, below should also type check (although it can be expressed with `properties` but it would be more verbose:

```typescript
type MyEnumRecord = Record<"a" | "b" | "c" | "d", number | undefined>

const myEnumRecordSchema: JSONSchemaType<MyEnumRecord> = {
  type: "object"
  propertyNames: {enum: ["a", "b", "c", "d"]}, // it won't check for completeness
  additionalProperty: {type: "number"}
}
```

(Although it would require properly supporting enum, which currently is not type checked at all)
