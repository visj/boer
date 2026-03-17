# uvd - a javascript type validator
uvd is a type validation library. It mainly consists of three parts:
- check, guarantee something is of type T
- validate, such as against json schema, limits
- diagnose, why a type is not valid

The goal of uvd is to offer zero allocation type validation for javascript. See section Performance for details. 

## Quick start
The uvd type system is built on raw, javascript numbers. A primitive type is represented as a simple bitset; more complex types are merely pointers to a continuous block of memory storage inside the uvd engine.
```ts
import { t, NUMBER, STRING, NULL, VOID, check, diagnose } from 'uvd';

const Payment = t.object({
  id: STRING,
  userId: STRING | NUMBER,
  paymentMethod: t.union('type', {
    card: t.object({
      type: t.literal('card'),
      cardNo: STRING,
    }),
    paypal: t.object({
      type: t.literal('paypal'),
      email: STRING,
    }),
  }),
  tags: t.array(STRING),
  comment: STRING | VOID
});

const json = {
  id: 123, // ❌ should be string
  userId: 'user_1',

  paymentMethod: {
    type: 'card',
    cardNo: 4242, // ❌ should be string
  },
  // comment missing, it's ok, it can be VOID
  tags: ['ok', 123], // ❌ second item invalid
};

if (!check(json, Payment)) {
  const errors = diagnose(json, Payment);
  console.log(errors);
}
```
The `t` object allocates every type into the uvd memory registry, and stays there for the duration of the program. You can also use uvd to do inline type guards and define schemas on the fly. For this purpose, uvd exposes a volatile api `v`:
```ts
import { v, NUMBER, STRING, NULL, check } from 'uvd';
const json = {
  id: 123,
  userId: 'user_1',

  paymentMethod: {
    type: 'card',
    cardNo: 4242,
  },

  tags: ['ok', 123],
};
const VolatilePayment = v.object({
  id: STRING,
  userId: STRING | NUMBER,
  paymentMethod: v.union('type', {
    card: v.object({
      type: v.literal('card'),
      cardNo: STRING,
    }),
    paypal: v.object({
      type: v.literal('paypal'),
      email: STRING,
    }),
  }),
  tags: v.array(STRING) | NULL,
});
if (!check(json, VolatilePayment))) {
  // VolatilePayment is immediately dropped and can never be used again.
}
```
## API

