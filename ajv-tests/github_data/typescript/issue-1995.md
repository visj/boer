# [1995] Define the Record occur typescript error

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.11.0, yes

**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->

```typescript
import type { JSONSchemaType } from 'ajv';

type Level = 0 | 1 | 2;
interface ValidateConfig {
    rules: Record<string, Level | [Level, object]>;
}

export const schema: JSONSchemaType<ValidateConfig> = {
    type: 'object',
    required: ['rules'],
    properties: {
        rules: {
            type: 'object',
            additionalProperties: {
                type: [
                    {
                        type: 'number',
                        enum: [0, 1, 2],
                    },
                    {
                        type: 'array',
                        minItems: 1,
                        items: [
                            {
                                type: 'number',
                                enum: [0, 1, 2],
                            },
                            {
                                type: 'object',
                            },
                        ],
                    },
                ],
            },
        },
    },
};
```

**Typescript compiler error messages**

```
Type '{ type: "object"; required: "rules"[]; properties: { rules: { type: "object"; additionalProperties: { type: ({ type: string; enum: number[]; } | { type: string; minItems: number; items: ({ type: string; enum: number[]; } | { ...; })[]; })[]; }; }; }; }' is not assignable to type 'UncheckedJSONSchemaType<ValidateConfig, false>'.
  The types of 'properties.rules' are incompatible between these types.
    Type '{ type: "object"; additionalProperties: { type: ({ type: string; enum: number[]; } | { type: string; minItems: number; items: ({ type: string; enum: number[]; } | { type: string; })[]; })[]; }; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<Record<string, Level | [Level, object]>, false> & { const?: Record<string, Level | [...]> | undefined; enum?: readonly Record<...>[] | undefined; default?: Record<...> | undefined; })'.
      Types of property 'additionalProperties' are incompatible.
        Type '{ type: ({ type: string; enum: number[]; } | { type: string; minItems: number; items: ({ type: string; enum: number[]; } | { type: string; })[]; })[]; }' is not assignable to type 'boolean | UncheckedJSONSchemaType<Level | [Level, object], false> | undefined'.
          Type '{ type: ({ type: string; enum: number[]; } | { type: string; minItems: number; items: ({ type: string; enum: number[]; } | { type: string; })[]; })[]; }' is not assignable to type '{ type: "array"; items: readonly [UncheckedJSONSchemaType<Level, false> & { const?: Level | undefined; enum?: readonly Level[] | undefined; default?: Level | undefined; }, UncheckedJSONSchemaType<...> & { ...; }] & { ...; }; minItems: 2; } & { ...; } & { ...; } & { ...; }'.
            Type '{ type: ({ type: string; enum: number[]; } | { type: string; minItems: number; items: ({ type: string; enum: number[]; } | { type: string; })[]; })[]; }' is missing the following properties from type '{ type: "array"; items: readonly [UncheckedJSONSchemaType<Level, false> & { const?: Level | undefined; enum?: readonly Level[] | undefined; default?: Level | undefined; }, UncheckedJSONSchemaType<...> & { ...; }] & { ...; }; minItems: 2; }': items, minItems
```

**Describe the change that should be made to address the issue?**

**Are you going to resolve the issue?**
