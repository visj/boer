# [67] TypeError: Converting circular structure to JSON

Not sure if this is expected behavior or not. But when I have all my definitions in one object and then extract a single definition to be the one that is tested and merge it back into the schema it throws the error given in the title. A simple (and nonsensical) example is given below it can also be seen and played with on https://tonicdev.com/jon/562a6c0a38427f0d009ed8b4. The example works if I `stringify` the object and then `parse` it again. I tried just doing a `cloneDeep` operation but the error persists.

``` js
var Ajv = require('ajv');
var _ = require('lodash');
var ajv = Ajv(); // options can be passed

var definitions ={ definitions: {
    "baz": {
    "properties": {
        "foo": { "type": "string" },
        "bar": { "type": "number", "maximum": 3 }
    }}
}};

var schema = _.assign(definitions, definitions.definitions.baz)
//schema = JSON.parse(JSON.stringify(schema))

var res = ajv.addSchema(schema, 'baz');

var validate = ajv.getSchema('baz');

test({"foo": "abc", "bar": 2});
test({"foo": 2, "bar": 2});

function test(data) {
    var valid = validate(data);
    if (valid) console.log('Valid!');
    else console.log('Invalid:' + ajv.errorsText(validate.errors));
}
```
