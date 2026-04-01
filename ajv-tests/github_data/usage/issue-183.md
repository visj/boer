# [183] Coerce type breaking with oneOf

cc @tnrich

I am using Ajv version 4.0.5. Using type coercion sometimes causes validation to fail where it would not have failed if type coercion was not used.

Here is an example snippet:

``` javascript
var schema = {
    "oneOf": [
        {"type": "null"}, 
        {"type": "integer"}
    ]
};

var valid = require("Ajv")({
        coerceTypes: false,
    })
    .validate(schema, null);

// true
console.log(valid)


var valid2 = require("Ajv")({
        coerceTypes: true,
    })
    .validate(schema, null);

// false
console.log(valid2)
```
