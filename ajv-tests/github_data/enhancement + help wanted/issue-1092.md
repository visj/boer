# [1092] report all duplicates with uniqueItems: "all" option

I have an array of simple scalar values and I want validation to fail when there is a duplicate. 

This works, however I want to be able to see all duplicates at once and not resolve them one at a time.

So I added the `allErrors` option into the solution and I still only see a single error.

Code to reproduce:
```js
var Ajv = require('ajv')

var ajv = new Ajv({ allErrors: true, uniqueItems: true });
var schema = {
  "type": "array",
  "items": [
    { "type": "number" }
  ],
  "uniqueItems": true
}

var data = [1, 1, 2, 3, 3];

var validate = ajv.compile(schema);

console.log(validate.errors);
```

Result: 
```js
[ { keyword: 'uniqueItems',
    dataPath: '',
    schemaPath: '#/uniqueItems',
    params: { i: 4, j: 3 },
    message:
     'should NOT have duplicate items (items ## 3 and 4 are identical)' } ]
```

From the docs: _allErrors: check all rules collecting all errors. Default is to return after the first error._