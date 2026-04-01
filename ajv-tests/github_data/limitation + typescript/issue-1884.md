# [1884] JSONSchemaType does not support type extension

I'm getting a type error when using the const, which should match that one property is set to the other.

I'm using the example code for `const`.

[typescript playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgKQMoHkByqDGALAUxAEMAVATzALgF84AzKCEOAcmICsA3VgKF+AA7GASj1iOagC0CMYgElEcAEbEoALjiCAriGWiA3AwgRNOvaJr8CAD0iw4OCIIDO8AF6zimtFlyESCioAHhk5eQA+OABeRF44ODAmKlhgAhdNBHiElTVMx2c3fIASABNiOU1WAEYAenoTVlpaABpshIbTJRhKAirzfSgmqwSaNoSoAgBHbWBJ0s0AbVZO1ha2VSGAXXG4HqoqiGUOAhwYPhogA)

> Type '{ properties: { bar: { const: { $data: string; }; }; foo: { type: "number"; }; }; required: ("foo" | "bar")[]; type: "object"; }' is not assignable to type 'UncheckedJSONSchemaType<ZetaI, false>'.
  The types of 'properties.bar' are incompatible between these types.
    Type '{ const: { $data: string; }; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<number, false> & { const?: number | undefined; enum?: readonly number[] | undefined; default?: number | undefined; })'.
      Types of property 'const' are incompatible.
        Type '{ $data: string; }' is not assignable to type 'number'.(2322)

```typescript
import { JSONSchemaType } from 'ajv'

interface ZetaI { bar: number; foo: number}

export const zeta: JSONSchemaType<ZetaI> = {
  properties: {
    bar: { const: { $data: '1/foo' } },
    foo: { type: 'number' }
  },
  required: ['foo', 'bar'],
  type: 'object'
}
```