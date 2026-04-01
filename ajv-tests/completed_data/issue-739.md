# [739] format 'uri' doesn't work with relative URIs

As defined in [rfc3986](http://tools.ietf.org/html/rfc3986), a URI can be absolute or relative. 
ajv fails when the value is a relative URI. See the following example: 

```js
var Ajv = require('ajv');
var ajv = new Ajv({allErrors: true});

var schema = {
  "properties": {
    "foo": { "type": "string", format: "uri" }
  }
};

var validate = ajv.compile(schema);

test(1, {"foo": "file:///dir/absolute.txt"});
test(2, {"foo": "https://google.com/absolute"});
test(3, {"foo": "./dir/relative.txt"});

function test(id, data) {
  var valid = validate(data);
  if (valid) console.log('Test#'+id+' Valid!');
  else console.log('Test#'+id+' Invalid: ' + ajv.errorsText(validate.errors));
}
```

The result of its execution is:

```
Test#1 Valid!
Test#2 Valid!
Test#3 Invalid: data.foo should match format "uri"
```