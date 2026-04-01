# [635] "default" should work inside "then" and "else"

Using version 6 beta.

``` javascript
var options = {
    allErrors: false,
    verbose: true,
    useDefaults: true,
    jsonPointers: true
};

var schema = {
    "properties": {
        "i": { "type": "string", "default": "foo" }
    },
    "if": { "type": "object" },
    "then": {
        "properties": {
            "k": { "type": "string", "default": "bar" }
        }
    }
};

var doc = {
    "j": true
};

var Ajv = require('ajv');
var ajv = new Ajv(options);
var v = ajv.compile(schema);
var valid = v(doc);

console.log('');
console.log('d=',d);
console.log('d.i=',d.i);
console.log('d.j=',d.j);
console.log('d.k=',d.k);
```

RESULTS:
d= { j: true, i: 'foo' }
d.i= foo
d.j= true
d.k= undefined

Can I cause "d.k" to be filled in by "default"?  The default does not appear in "xxxOf".