# [1664] JSONSchemaType incorrectly requires optional properties to be nullable

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Ajv 8.6.0, Typescript 4.3.4

**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->

```typescript
import { JSONSchemaType } from 'ajv/dist/2020';

interface Example {
  foo: string;
  bar?: string;
}

const schema: JSONSchemaType<Example> = {
  additionalProperties: false,
  type: 'object',
  properties: {
    foo: {
      type: 'string'
    },
    bar: {
      type: 'string'
    }
  },
  required: ['foo']
};
```

**Typescript compiler error messages**

```
TS2322: Type '{ additionalProperties: false; type: "object"; properties: { foo: { type: "string"; }; bar: { type: "string"; }; }; required: "foo"[]; }' is not assignable to type 'UncheckedJSONSchemaType<Example, false>'.
  Type '{ additionalProperties: false; type: "object"; properties: { foo: { type: "string"; }; bar: { type: "string"; }; }; required: "foo"[]; }' is not assignable to type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }'.
    Type '{ additionalProperties: false; type: "object"; properties: { foo: { type: "string"; }; bar: { type: "string"; }; }; required: "foo"[]; }' is not assignable to type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; }'.
      The types of 'properties.bar' are incompatible between these types.
        Type '{ type: "string"; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<string | undefined, false> & { nullable: true; const?: undefined; enum?: readonly (string | null | undefined)[] | undefined; default?: string | ... 1 more ... | undefined; })'.
          Type '{ type: "string"; }' is not assignable to type '{ type: "string"; } & StringKeywords & { allOf?: readonly UncheckedPartialSchema<string | undefined>[] | undefined; anyOf?: readonly UncheckedPartialSchema<string | undefined>[] | undefined; ... 4 more ...; not?: UncheckedPartialSchema<...> | undefined; } & { ...; } & { ...; }'.
            Property 'nullable' is missing in type '{ type: "string"; }' but required in type '{ nullable: true; const?: undefined; enum?: readonly (string | null | undefined)[] | undefined; default?: string | null | undefined; }'.
```

**Describe the change that should be made to address the issue?**

This code will not compile unless bar is marked as `nullable` in the schema. However, I don't want to accept `null` as a value for bar if it is present. It appears that `JSONSchemaType` expects all properties not mentioned in the `required` array to be marked as `nullable`. `null` and `undefined` are different values and should not be conflated.

**Are you going to resolve the issue?**
🤷 
