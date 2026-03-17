# uvd - a javascript type validator
uvd is a type validation library. It mainly consists of three parts:
- check, guarantee something is of type T
- validate, such as against json schema, limits
- diagnose, why a type is not valid

The goal of uvd is to offer zero allocation type validation for javascript. See section Performance for details. 

## Quick start
The uvd type system is built on raw, javascript numbers. A primitive type is represented as a simple bitset; more complex types are merely pointers to a continuous block of memory storage inside the uvd engine.
```ts
import { Schema, check, diagnose } from 'uvd';

const t = new Schema();

const Payment = t.object({
  id: t.string,
  userId: t.string | t.number,
  paymentMethod: t.union('type', {
    card: t.object({
      type: t.literal('card'),
      cardNo: t.string,
    }),
    paypal: t.object({
      type: t.literal('paypal'),
      email: t.string,
    }),
  }),
  tags: t.array(t.string) | t.null,
});

const json = {
  id: 123, // ❌ should be string
  userId: 'user_1',

  paymentMethod: {
    type: 'card',
    cardNo: 4242, // ❌ should be string
  },

  tags: ['ok', 123], // ❌ second item invalid
};

if (!check(json, Payment)) {
  const errors = diagnose(json, Payment);
  console.log(errors);
}
```
## API

