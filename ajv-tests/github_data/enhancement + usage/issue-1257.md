# [1257] Coercing data types should support "date/number" to "string"

Currently `Coercing data types` only supports "string" to "date/number/boolean"

Could we consider to also support the opposite way? I think it really important, or we need to write some ugly code to match the schema.

For example, following code should be excepted working.

```js
var ajv = new Ajv({ coerceTypes: true });
var schema = {
  "type": "object",
  "properties": {
    "foo": { "type": "string" },
    "bar": { "type": "string" }
  },
  "required": [ "foo", "bar" ]
};

var data = { "foo": 1, "bar": false };

var validate = ajv.compile(schema);

console.log(validate(data)); // true
console.log(data); // { "foo": "1", "bar": "false" }
```