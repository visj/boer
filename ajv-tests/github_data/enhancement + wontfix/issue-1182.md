# [1182] Default coercing of number from `null` should be NaN

**What version of Ajv you are you using?**

6.12.0

**What problem do you want to solve?**

Roundtrip numbers.

**What do you think is the correct solution to the problem?**

It is clear that roundtripping IEEE 754 floats is unfortunately not possible via JSON, because of the omission of the IEEE 754 literals for NaN, and +/-Infinity.

However, coercing `null` to `0` is an extremely unfortunate decision that aggravates this limitation in JSON. In my opinion coercing to `NaN` is the only sensible value.

Consider a typical roundtrip of NaN/Infs:

![image](https://user-images.githubusercontent.com/3620703/78252098-9b9eba80-74f2-11ea-8f40-5c93b4067352.png)

Because JSON supports only a subset if IEEE 754, `JSON.stringify` follows the convention of mapping NaN/Infs to `null`. In total the current coercing default leads to the extremely dangerous transition from NaN/Infs to `0`, which opens the door to all kinds of bugs. (We immediately ran into them after starting using ajv.)

The coerced value should be `NaN` because:
- `null` isn't a number, and IEEE 754 has a value for representing the "not a number case".
- Correct roundtrip of `NaN`: Coercing to 0 not only introduces bugs, it also misses the opportunity that at least one of the three non-representable numbers have a correct roundtrip path.

On second thought, I'd actually consider this a bug.

Minimal example:

```js
var ajv = new Ajv({ coerceTypes: true })

var schema = {
  "type": "object",
  "properties": {
    "foo": { "type": "number" },
  },
  "required": [ "foo" ]
}
var validate = ajv.compile(schema)

var data = JSON.parse(JSON.stringify({ foo: NaN }))
console.log(data)
var valid = validate(data)
console.log(data)
// ouch: foo has become a 0
```

**Will you be able to implement it?**

Probably.