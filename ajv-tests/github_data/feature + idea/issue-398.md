# [398] $param(s) to allow parametrized schemas

Support schemas with parameters, e.g.

```javascript
{
  id: 'range',
  $params: {
    min: { type: 'number'},
    max: { type: 'number'}
  },
  type: 'integer',
  minimum: { $param: 'min' },
  maximum: { $param: 'min' }
}
```

Then another schema can refer to the first schema using $ref and "pass" parameters:

```javascript
{
  type: 'object',
  properties: {
    foo: { $ref: 'range', $params: { min: 0, max: 9 } },
    bar: { $ref: 'range', $params: { min: 10, max: 99 } },
  }
}
```

So the second schema can create different constraints by using only one `range` schema.
The example is trivial and using params in such way is not very useful, but $params become useful with more complex schemas when only a small part of the schema changes based on parameters.

If `range` is compiled on its own it would return a higher order function that can be passed parameters to return a validation function:

```javascript
var getRangeValidate = ajv.compile(rangeSchema); // first example
var validate = getRangeValidate(0, 9);
validate(0); // true
validate(9); // true
validate(10); // false
validate(-1); // false
```

The last example you can already do (almost) with $data (by merging data and parameters in the same object and merging schemas for data and parameters too), but it feels clunky and hiding the distinction between data and parameters.

Referring to schemas with params cannot be done though.