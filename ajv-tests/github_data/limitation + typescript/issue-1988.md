# [1988] SomeJSONSchema does not accept correct JSONSchemaType object

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Latest: 8.11.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

not applicable - errors with TS types

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```ts
interface Body {
    data: Record<string, unknown>;
}

const bodySchema: JSONSchemaType<Body> = {
    '$schema': 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
        data: {
            type: 'object',
        },
    },
    required: ['data'],
};

export const eventSchema: SomeJSONSchema = {
    '$schema': 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
        body: bodySchema,
    },
    required: ['body'],
};
```

TS error: 

```
TS2322: Type '{ $schema: string; type: "object"; properties: { body: { type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | ... 1 more ... | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }; }; requi...' is not assignable to type 'SomeJSONSchema'. 
  Types of property 'properties' are incompatible. 
    Type '{ body: { type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }; }' is not assignable to type 'Partial<UncheckedPropertiesSchema<{ [key: string]: Known; }>>'. 
      Property 'body' is incompatible with index signature. 
        Type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<Known, false> & { const?: Known | undefined; enum?: readonly Known[] | undefined; default?: Known | undefined; }) | undefined'. 
          Type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }' is not assignable to type '{ $ref: string; }'. 
            Types of property '$ref' are incompatible. 
              Type 'string | undefined' is not assignable to type 'string'. 
                Type 'undefined' is not assignable to type 'string'.
```

**What results did you expect?**

`SomeJSONSchema` should be possible to be composed of other valid schema objects.

**Are you going to resolve the issue?**

It can be over my possibilities.