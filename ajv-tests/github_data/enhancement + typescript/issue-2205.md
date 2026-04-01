# [2205] Typescript 4.9 `satisfies` does not properly enforce enum on `SomeJTDSchemaType`

Ajv version `8.12.0`

Typescript 4.9 allows us to use the `satisfies` operator, which can be used to enforce the correctness of a schema through `SomeJTDSchemaType` before sending it to `JTDDataType`:

```typescript
const schema1 = { type: 'string' } as const satisfies SomeJTDSchemaType;

type Schema1 = JTDDataType<typeof schema1>;

// No error, Schema1 = string as expected


const schema2 = { type: 'something_else' } as const satisfies SomeJTDSchemaType;

type Schema2 = JTDDataType<typeof schema2>;

// Error on the `satisfies SomeJTDSchemaType`, as expected:
//   Type '{ readonly type: "something_else"; }' does not satisfy the expected type 'SomeJTDSchemaType'.
//   Types of property 'type' are incompatible.
//   Type '"something_else"' is not assignable to type '"boolean" | NumberType | StringType | undefined'.
```

This feature does not work properly with `enum` types:

```typescript
const schema3 = { enum: ['apple', 'banana'] } as const satisfies SomeJTDSchemaType;

type Schema3 = JTDDataType<typeof schema3>;

// Although this should be fine, we have an unexpected error on `satisfies SomeJTDSchemaType`:
//   Type '{ readonly enum: readonly ["apple", "banana"]; }' does not satisfy the expected type 'SomeJTDSchemaType'.
//   Types of property 'enum' are incompatible.
//   The type 'readonly ["apple", "banana"]' is 'readonly' and cannot be assigned to the mutable type 'string[]'.
```

In fact, in `types/jtd-schema.ts:14`, we see that `SomeJTDSchemaType` contains `{enum: string[]}`, to which `readonly [...]` cannot be assigned to.

This seems fixable by simply changing the enum type in this file to `{enum: readonly string[]}`.

Can I open a PR for that?