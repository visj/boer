# [152] coerceTypes overrides property value from previous property

``` javascript
var Ajv = require('ajv');
var ajv = Ajv({ coerceTypes: true });

var schema = {
  type: 'object',
  properties: {
    foo: {
      type: 'number'
    },
    bar: {
      type: 'number'
    }
  }
};

var ob = {
  foo: '123',
  bar: 'asdad'
};

var valid = ajv.validate(schema, ob);

console.log(ob); // { foo: 123, bar: 123 }

console.log(ajv.errorsText()); // No errors
```
