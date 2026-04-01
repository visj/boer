# [1622] Incorrect type when using "null" in the unions

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.5.0

**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->

When I use example from the docs:

```typescript
type MyUnion = number | string;

const schema: JSONSchemaType<MyUnion> = {
  type: ["number", "string"],
};
```

everything is fine. But if I change string to `null`

```typescript
type MyUnion = number | null;

const schema: JSONSchemaType<MyUnion> = {
  type: ["number", "null"],
};
```

**Typescript compiler error messages**

```
Type '{ type: ("number" | "null")[]; }' is not assignable to type 'UncheckedJSONSchemaType<MyUnion, false>'.
  Type '{ type: ("number" | "null")[]; }' is not assignable to type '{ type: "number" | "integer"; } & NumberKeywords & { allOf?: readonly UncheckedPartialSchema<MyUnion>[] | undefined; anyOf?: readonly UncheckedPartialSchema<MyUnion>[] | undefined; ... 4 more ...; not?: UncheckedPartialSchema<...> | undefined; } & { ...; }'.
    Type '{ type: ("number" | "null")[]; }' is not assignable to type '{ type: "number" | "integer"; }'.
      Types of property 'type' are incompatible.
        Type '("number" | "null")[]' is not assignable to type '"number" | "integer"'.
          Type '("number" | "null")[]' is not assignable to type '"integer"'.
```

**Describe the change that should be made to address the issue?**

Should work as in example with `number | string`.

**Are you going to resolve the issue?**
No