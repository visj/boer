# [2085] Schema utilities to mirror TypeScript's utility types

**What version of Ajv you are you using?**
8.11

**What problem do you want to solve?**

I'm using Ajv as a runtime companion for TypeScript / to generate type guards for my types.
TypeScript has a series of [utility types](https://www.typescriptlang.org/docs/handbook/utility-types.html) which make it easy to perform certain modifications to existing types without having to re-define the base type.  For example I might [`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys) an `id` attribute in the context of a `create` method.

Currently I need to re-define the entire corresponding Ajv schema in these instances if I want a type guard for the new "utilitied" type.  This is an issue because it violates DRY in ways that TypeScript has prevented -- if I were to modify the base type / schema I now need to remember to update the contextual schema manually.

It would be wonderful to have a mirrored set of utility functions within the ajv ecosystem which would take a schema and return a modified schema.  For example:

```
interface Foo {
  id: number;
  bar: string;
}

const fooSchema: JSONSchemaType<Foo> = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    bar: { type: 'string' },
  },
  required: [ 'id', 'bar' ],
};

// This next schema might be used in the context of a POST /foo endpoint
const modifiedFooSchema: JSONSchemaType<Omit <Foo, 'id'>> = ajv.utilities.omit(
  fooSchema,
  [ 'id' ]
);
```

**What do you think is the correct solution to problem?**

I imagine this would NOT make sense to be built into core ajv, but maybe this would be appropriate as an ajv plugin.

**Will you be able to implement it?**

If this fits into the vision of the Ajv team and I have some high level guidance about the best *way* to implement it (e.g. "this should be a plugin!"), I could create an implementation.
