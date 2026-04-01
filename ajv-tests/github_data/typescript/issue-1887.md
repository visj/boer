# [1887] Array `items` property should not be required in all array schemas

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

ajv@8.9.0

**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->

```typescript
const schema: JSONSchemaType<any[]> = { type: 'array' }
```

OR 

```typescript
const schema: JSONSchemaType<any[]> = { type: 'array', contains: { type: 'number' } }
```

**Typescript compiler error messages**

```
TS2322: Type '{ type: "array"; }' is not assignable to type 'UncheckedJSONSchemaType<any[], false>'.   Type '{ type: "array"; }' is not assignable to type '{ type: "array"; items: UncheckedJSONSchemaType<any, false>; contains?: UncheckedPartialSchema<any> | undefined; minItems?: number | undefined; ... 4 more ...; additionalItems?: undefined; } & { ...; } & { ...; }'.     Property 'items' is missing in type '{ type: "array"; }' but required in type '{ type: "array"; items: UncheckedJSONSchemaType<any, false>; contains?: UncheckedPartialSchema<any> | undefined; minItems?: number | undefined; ... 4 more ...; additionalItems?: undefined; }'.
```

**Describe the change that should be made to address the issue?**

When using the `contains` keyword, the `items` property should not be defined.

Json Schema Docs: https://json-schema.org/understanding-json-schema/reference/array.html#contains

```typescript
type UncheckedJSONSchemaType<T, IsPartial extends boolean> = (
...
: T extends readonly any[]
      ? {
          type: JSONType<"array", IsPartial>
          items: UncheckedJSONSchemaType<T[0], false>
//        ^^^^ Should be made optional
          contains?: UncheckedPartialSchema<T[0]>
          minItems?: number
          maxItems?: number
          minContains?: number
          maxContains?: number
          uniqueItems?: true
          additionalItems?: never
        }
...
)
```

**Are you going to resolve the issue?**

This could be as simple as making the `items` property optional. This is the simplest and probably the most accurate solution.

PR https://github.com/ajv-validator/ajv/pull/1888
