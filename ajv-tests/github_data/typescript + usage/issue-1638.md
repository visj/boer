# [1638] JSONSchemaType does not work when $ref is used

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
v8.5.0
**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->

```typescript
interface Item {
    name: string;
    value: string;
}

interface Obj {
    collection: Item[];
}

const schema: JSONSchemaType<Obj> = {
    type: 'object',
    properties: {
        collection: {
            type: 'array',
            items: {
                $ref: '#definitions/Single',
            },
        },
    },
    required: [],
    definitions: {
        Single: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                value: { type: 'string' },
            },
            required: [],
        },
    },
};
```

**Typescript compiler error messages**

```
Type '{ type: "object"; properties: { collection: { type: "array"; items: { $ref: string; }; }; }; required: never[]; definitions: { Single: { type: "object"; properties: { name: { type: "string"; }; value: { type: "string"; }; }; required: never[]; }; }; }' is not assignable to type 'UncheckedJSONSchemaType<Obj, false>'.
  Type '{ type: "object"; properties: { collection: { type: "array"; items: { $ref: string; }; }; }; required: never[]; definitions: { Single: { type: "object"; properties: { name: { type: "string"; }; value: { type: "string"; }; }; required: never[]; }; }; }' is not assignable to type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }'.
    Type '{ type: "object"; properties: { collection: { type: "array"; items: { $ref: string; }; }; }; required: never[]; definitions: { Single: { type: "object"; properties: { name: { type: "string"; }; value: { type: "string"; }; }; required: never[]; }; }; }' is not assignable to type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; }'.
      The types of 'properties.collection' are incompatible between these types.
        Type '{ type: "array"; items: { $ref: string; }; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<Item[], false> & { const?: Item[] | undefined; enum?: readonly Item[][] | undefined; default?: Item[] | undefined; })'.
          Type '{ type: "array"; items: { $ref: string; }; }' is not assignable to type '{ type: "array"; items: UncheckedJSONSchemaType<Item, false>; contains?: UncheckedPartialSchema<Item> | undefined; ... 5 more ...; additionalItems?: undefined; } & { ...; } & { ...; } & { ...; }'.
            Type '{ type: "array"; items: { $ref: string; }; }' is not assignable to type '{ type: "array"; items: UncheckedJSONSchemaType<Item, false>; contains?: UncheckedPartialSchema<Item> | undefined; ... 5 more ...; additionalItems?: undefined; }'.
              Types of property 'items' are incompatible.
                Type '{ $ref: string; }' is not assignable to type 'UncheckedJSONSchemaType<Item, false>'.
                  Type '{ $ref: string; }' is not assignable to type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }'.
                    Property 'type' is missing in type '{ $ref: string; }' but required in type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; }'.ts(2322)
json-schema.d.ts(56, 5): 'type' is declared here.
```

**Describe the change that should be made to address the issue?**

`type` should not be a required property. Here's an example from [the specification](https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-9): 

```
{
       "type": "array",
       "items": { "$ref": "#/definitions/positiveInteger" },
       "definitions": {
           "positiveInteger": {
               "type": "integer",
               "exclusiveMinimum": 0
           }
       }
   }

```



**Are you going to resolve the issue?**
No, since I don't know how to solve it. 