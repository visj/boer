# [205] add property to object with additionalProperties: false from switch

should this be possible:

```
{
  type: 'object',
  properties: {
    foo: { type: 'array', minItems: 2 },
    bar: { type: 'string' }
  },
  additionalProperties: false,
  required: [ 'foo', 'bar' ],
  switch: [{
    if: { properties: { bar: { constant: 'testing } } },
    then: {
      properties: { baz: { type: 'string' } },
      required: [ 'foo', 'bar', 'baz' ]
    }
  }]
}
```

It seems unclear from the documentation, but shouldn't I technically be able to even set `additionalProperties: true` in the switch's `then`?
