# [1375] `undefined` treated as `null`able in JSONSchemaType

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

7.0.2, yes

**Your typescript code**

```
const testSchema: JSONSchemaType<{ a?: string }> = {
    type: "object",
    properties: { a: { type: "string" } },
    required: [],
};
```
produces the following error, but
```
const testSchema: JSONSchemaType<{ a: string | null }> = {
  type: "object",
  properties: { a: { type: "string" } },
  required: ["a"],
};
```
type checks fine.

**Typescript compiler error messages**

```
error TS2322: Type '{ type: "string"; }' is not assignable to type '{ $ref: string; } | ({ type: "string"; minLength?: number | undefined; maxLength?: number | undefined; pattern?: string | undefined; format?: string | undefined; } & { [keyword: string]: any; ... 10 more ...; not?: Partial<...> | undefined; } & { ...; })'.
  Type '{ type: "string"; }' is not assignable to type '{ type: "string"; minLength?: number | undefined; maxLength?: number | undefined; pattern?: string | undefined; format?: string | undefined; } & { [keyword: string]: any; $id?: string | undefined; ... 9 more ...; not?: Partial<...> | undefined; } & { ...; }'.
    Property 'nullable' is missing in type '{ type: "string"; }' but required in type '{ nullable: true; const?: undefined; enum?: (string | null | undefined)[] | undefined; default?: string | null | undefined; }'.

     properties: { a: { type: "string" } },
                   ~

  node_modules/ajv/dist/types/json-schema.d.ts:95:5
    95     nullable: true;
           ~~~~~~~~
    'nullable' is declared here.
```

**Describe the change that should be made to address the issue?**

In essence the current type definition says that any non-required field should be nullable, but there is a distinction between null and undefined. I think the change should just be making [this line](https://github.com/ajv-validator/ajv/blob/master/lib/types/json-schema.ts#L109) `null extends T` instead of `undefined extends T`

I could also see another change that adds undefined to possible values in enum / default if `undefined extends T`, but maybe that's not necessary since in general json does not allow for undefined values.

This change would also be breaking since the second example will now error as it used to compile (although the error seems correct).

**Are you going to resolve the issue?**

I can, but I'm seeking guidance on the fix first. Javascript distinguishes between `undefined` and `null` but json doesn't, or more specifically `undefined` would imply an omitted field, where as `null` is a value. However, it's not that simple since in some cases it seems that undefined values are omitted (in the case of object values) whereas in other cases they're serialized as a null value (array elements). Therefore this change doesn't seem super straightforward.
