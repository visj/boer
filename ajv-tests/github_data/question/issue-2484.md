# [2484] Picking or Omiting Certain Properties From a Schema Definition to make another definition

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?** 8.17.1

**What problem do you want to solve?** Avoiding Repetition

**What do you think is the correct solution to problem?** Extending Existing Schemas

**Will you be able to implement it?** I Think not

Hello,

Is there any way to extend existing schemas in any way? Like consider the following schema:

```
const T1: JSONSchemaType<SomeType> = {
    type: 'object',
    required: ['p1', 'p2', 'p3'],
    properties: {
        p1: { type: 'string' },
        p2: { type: 'string' },
        p3: { type: 'string' }
    }
} as const;
```

Now, I want to make another schema to have all properties of schema T1, and some additional properties. (extending existing schema)

And yet another Schema, which should have all properties of T1, except some. ("Picking" or "Omitting" certain properties from existing schema.

Apologies if this feature already exists, I tried to read documentation at my best. Also, another similar library named Zod has this feature, if someone needs [reference](https://zod.dev/?id=pickomit).

Thank you for help