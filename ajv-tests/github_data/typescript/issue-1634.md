# [1634] validating data within Maps and Sets

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

v8.5.0

**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->

```typescript

export interface NestedMap {
  foo: string;
  bar: Map<string, string>;
}

export const MAP_SCHEMA: JSONSchemaType<NestedMap> = {
  type: 'object',
  properties: {
    foo: {
      type: 'string',
    },
    bar: {
      type: 'object',
      properties: {
        clear: {
          type: 'object',
        },
        delete: {
          type: 'object',
        },
        forEach: {
          type: 'object',
        },
        // some methods omitted
        values: {
          type: 'object',
        },
      },
      required: [],
    },
  },
  required: ['foo', 'bar'],
};
```

The schema type expects all of the methods on `Map` to be specified as objects, but does not provide a type for the data within the `Map`.

**Typescript compiler error messages**

Leaving out some of the methods causes:

```
Types of property 'properties' are incompatible.
  Property 'delete' is missing in type '{ clear: { type: "object"; }; forEach: { type: "object"; }; has: { type: "object"; }; get: { type: "object"; }; set: { type: "object"; }; size: { type: "number"; }; entries: { type: "object"; }; keys: { type: "object"; }; values: { ...; }; }' but required in type 'UncheckedPropertiesSchema<Map<string, string>>'.  ts(2322)
```

**Describe the change that should be made to address the issue?**

I'm not sure how to validate the data within the `Map` (or `Set`): `keys` and `values` are both required to be present in the schema, but return iterators. I checked the docs and additional keywords repo, but have not found a conclusive answer.

In general, I would expect `JSONSchemaType` to omit methods, some kind of `T extends Function ? never : ...` clause in the mapped type might do the trick. A `type: 'object'` is not really meaningful for a method (is it?), and on a whim I tried to define the type of `values`, which is allowed but does not seem right:

```typescript
        values: {
          type: 'object',
          properties: {
            [Symbol.iterator]: {
              type: 'array',
              items: {
                type: 'string',
              }
            }
          },
          required: [],
        },
```

Within each of the methods (like the above), `required` is `Array<never>`.

Is this a case for user-defined keywords, or something that needs to be changed within the typedef?

**Are you going to resolve the issue?**

Happily, if I can get some advice on the correct method.