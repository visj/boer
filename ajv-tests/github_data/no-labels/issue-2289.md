# [2289] Mixed Type Typescript Validation

So I'm trying to use Ajv to validate JSON against our typescript types as a single source of truth. I have this 99% working for multiple types/checks, but am running into a small issue with a specific mixed type. I tried to reduce the examples as much as possible for the sake of this issue, sorry if I missed a bracket or comma! The only workaround I have found is to place `as any` at the end of the schema which negates the single source of truth approach I'm trying to take. Any insight would be super appreciated!

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.12.0

**Typescript Type**
```
defaultValue?: string | boolean | number | string[];
```

**Javascript Schema that works but throws a Typescript error**
```
export const schema: JSONSchemaType<ModuleJsonSection> = {
  items: {
    type: "object",
    required: [],
    properties: {
      defaultValue: {
        oneOf: [
          {
            type: "array",
            nullable: true,
            items: {
              type: "string",
            },
          },
          {
          type:[
              "string",
              "boolean",
              "integer",
            ],
            nullable: true,
          },
       },
    },
}
```

**TypeScript Error**

```
The types of 'properties.defaultValue' are incompatible between these types.
 Type '{ oneOf: ({ type: "array"; nullable: boolean; items: { type: "string"; }; } | { type: ("string" | "boolean" | "integer")[]; nullable: boolean; })[]; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<string | number | boolean | string[] | undefined, false> & { nullable: true; const?: null | undefined; enum?: readonly (string | ... 4 more ... | undefined)[] | undefined; default?: string | ... 4 more ... | undefined; })'.
  Type '{ oneOf: ({ type: "array"; nullable: boolean; items: { type: "string"; }; } | { type: ("string" | "boolean" | "integer")[]; nullable: boolean; })[]; }' is not assignable to type '{ type: "array"; items: UncheckedJSONSchemaType<string, false>; contains?: UncheckedPartialSchema<string> | undefined; minItems?: number | undefined; ... 4 more ...; additionalItems?: undefined; } & { ...; } & { ...; } & { ...; }'.
   Type '{ oneOf: ({ type: "array"; nullable: boolean; items: { type: "string"; }; } | { type: ("string" | "boolean" | "integer")[]; nullable: boolean; })[]; }' is missing the following properties from type '{ type: "array"; items: UncheckedJSONSchemaType<string, false>; contains?: UncheckedPartialSchema<string> | undefined; minItems?: number | undefined; ... 4 more ...; additionalItems?: undefined; }': type, itemsts(2322)
```

I was unable to post a working code sample in RunKit because it didn't support TypeScript (from what I saw anyway...)

**What results did you expect?**
For it to run and to not throw a typescript error.

**Are you going to resolve the issue?**
I'm trying to.