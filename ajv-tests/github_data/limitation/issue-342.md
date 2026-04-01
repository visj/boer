# [342] Two RegExps are considered equal via `uniqueItems`

In the latest version of Ajv, as used by Webpack 2, `uniqueItems` fails on two RegExps due to the [equal function](https://github.com/epoberezkin/ajv/blob/6723287c3e8b4464f5ca65ad68fbb7d604c7012a/lib/compile/equal.js)

```js
function equal(a, b) {
  if (a === b) return true;

  var arrA = Array.isArray(a)
    , arrB = Array.isArray(b)
    , i;

  if (arrA && arrB) {
    if (a.length != b.length) return false;
    for (i = 0; i < a.length; i++)
      if (!equal(a[i], b[i])) return false;
    return true;
  }

  if (arrA != arrB) return false;

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    var keys = Object.keys(a);

    if (keys.length !== Object.keys(b).length) return false;

    for (i = 0; i < keys.length; i++)
      if (b[keys[i]] === undefined) return false;

    for (i = 0; i < keys.length; i++)
      if(!equal(a[keys[i]], b[keys[i]])) return false;

    return true;
  }

  return false;
}
undefined
equal(/foo/, /bar/)
true
```

This should likely check if `Object.getPrototypeOf(a) === Object.prototype && Object.getPrototypeOf(b) === Object.prototype` before simply checking keys (RegExps have no enumerable keys, nor would other class objects, etc). Otherwise, we could use something like the standalone lodash.deepEqual.