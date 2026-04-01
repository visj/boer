# [549] Non-mutating useDefaults option

**What version of Ajv you are you using?**
5.2.2

**What problem do you want to solve?**
I want a non-mutating version of the [`useDefaults`](https://github.com/epoberezkin/ajv#assigning-defaults) option.

**What do you think is the correct solution to problem?**
I think that instead of mutating the passed in data, we could set a property on the `ajv` object with the values, similar to how we do it with errors. Example:

```js
var ajv = new Ajv({ useDefaults: true });
var schema = {
  "type": "object",
  "properties": {
    "foo": { "type": "number" },
    "bar": { "type": "string", "default": "baz" }
  },
  "required": [ "foo", "bar" ]
};

var data = { "foo": 1 };

var validate = ajv.compile(schema);

console.log(validate(data)); // true
console.log(data); // { "foo": 1 } (unchanged)
console.log(ajv.result); // { "foo": 1, "bar": "baz" }
```

Note: this technique could be applied to filtering and coercing data types as well.

**Will you be able to implement it?**
Sure thing. With some help understanding doT and why it's used for source code.