# [1595] Using JSONSchemaType requires strictNullChecks option

Ajv `v8.2.0`

Straight from the example here: https://ajv.js.org/guide/typescript.html

You can see this error in the [TS Playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAQQFYDcA0cDeApAygeQDlcBjACwFMQBDAFQE8wKBfOAMyghDgCJrUeAKEEkIAOwDO8fijgBeOGIoB3RKgAUASmHAxMClDbUSFOAFl6AEWoxqWQXHYQIALkUBXEACMDDuF+ooAH43KShdAHNBZmFRSXgJcipqNzwiUkoaBiYAHgtrWwA+eXtHGEYKNx4ILyQKEhgeND8wTiZYYAoJN0w-RzZnHvKmKt19CIMeZmbHRwCoIYqqsMimjwAbdeovdcreGCh3Cim-ab8oCgBHd2ALgBM3AG0eAYgeAF0ZuGo7u+AYYDiajrAAKbQMAK6biM6wkFGigiAA)

```typescript
import Ajv, {JSONSchemaType} from "ajv"
const ajv = new Ajv()

interface MyData {
  foo: number
  bar?: string
}

const schema: JSONSchemaType<MyData> = {
  type: "object",
  properties: {
    foo: {type: "integer"},
    bar: {type: "string", nullable: "true"}
  },
  required: ["foo"],
  additionalProperties: false
}
```

TS Error:

```
Type '{ type: "object"; properties: { foo: { type: "integer"; }; bar: { type: "string"; nullable: string; }; }; required: "foo"[]; additionalProperties: false; }' is not assignable to type 'JSONSchemaType<MyData, false>'.
  Type '{ type: "object"; properties: { foo: { type: "integer"; }; bar: { type: "string"; nullable: string; }; }; required: "foo"[]; additionalProperties: false; }' is not assignable to type '{ type: "object"; additionalProperties?: boolean | JSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | JSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }'.
    Type '{ type: "object"; properties: { foo: { type: "integer"; }; bar: { type: "string"; nullable: string; }; }; required: "foo"[]; additionalProperties: false; }' is not assignable to type '{ type: "object"; additionalProperties?: boolean | JSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | JSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; }'.
      The types of 'properties.bar' are incompatible between these types.
        Type '{ type: "string"; nullable: string; }' is not assignable to type '{ $ref: string; } | (JSONSchemaType<string | undefined, false> & { nullable: true; const?: undefined; enum?: readonly (string | null | undefined)[] | undefined; default?: string | null | undefined; })'.
          Type '{ type: "string"; nullable: string; }' is not assignable to type '{ type: "string"; } & StringKeywords & { allOf?: readonly PartialSchema<string | undefined>[] | undefined; anyOf?: readonly PartialSchema<string | undefined>[] | undefined; ... 4 more ...; not?: PartialSchema<...> | undefined; } & { ...; } & { ...; }'.
            Type '{ type: "string"; nullable: string; }' is not assignable to type '{ nullable: true; const?: undefined; enum?: readonly (string | null | undefined)[] | undefined; default?: string | null | undefined; }'.
              Types of property 'nullable' are incompatible.
                Type 'string' is not assignable to type 'true'.ts(2322)
```

