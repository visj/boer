# [516] updating `it.baseId` when using `$ref` with hash fragment

**What version of Ajv you are you using?**

4.11.8 and 5.1.5.

**What problem do you want to solve?**

In some cases, the base id is not updated when going inside a `$ref`. For example:
```js
var ajv = require('ajv')({ v5: true });
ajv.addKeyword('custom', { 
  compile: function (a, b, it) {
    console.log(it.baseId);
    return function () {};
  },
  valid: true
});
ajv.addSchema([
  { id: 'a', properties: { a: { $ref: 'b#/definitions/b' } } },
  { id: 'b', definitions: { b: { custom: 'keyword' } } }
]);
ajv.validate('a', { a: 1 });
ajv.validate('b#/definitions/b',1);
```
reveals the custom keyword “thinks” the base id is still `"a"` when invoked from `"a"`, but is `"b"` when invoked from `"b#/definitions/b"`.

It seems this happens exactly when the `$ref`'ed schema doesn't have an explicit `id` set in the schema itself (in this example, the id is set only at the `"b"` level, not at `"b#/definitions/b"`).

However, nested `$ref`s are not affected by this problem at all: they keep resolving to the correct schema. It's only when we nest a custom keyword inside (any number of nested) `$ref`s that it's possible to get a mismatch.

**What do you think is the correct solution to problem?**

It would be nice to have the base id even in these cases. However, I'm not even sure whether this is a bug report or a feature request, as the spec doesn't address this case directly. Still, it would be nice to have the same base id independently of how the schema is invoked.

There's a closed issue that apparently involved a similar case, so maybe this one is a leftover corner case?

**Will you be able to implement it?**

I was not (yet) able to figure how/where the change would be made.
