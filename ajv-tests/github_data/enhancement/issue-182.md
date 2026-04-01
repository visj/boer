# [182] NaN validates as integer, ignoring minimum

``` js
const schema = {
  type: 'object',
  properties: {
    n: {
      type: 'integer',
      minimum: 1
    }
  }
};

validator = ajv()
validator.validate(schema, {n: NaN});  // true!
```

`NaN` should not be accepted as an integer, and does not meet the `minimum: 1` condition.

Is this per the spec, or a bug?
Thank you!
