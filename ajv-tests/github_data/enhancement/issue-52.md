# [52] compileAsync race condition

If a schema has a $ref and compileAsync is called on it while another compileAsync is running on it then ajv randomly throws. Here is an example:

``` js
var Ajv = require('ajv');

var schemas =  {
  "http://example.com/parent.json": {
    "id": "http://example.com/parent.json",
    "required": [
      "a"
    ],
    "properties": {
      "a": { "$ref": "child.json" }
    }
  },
  "http://example.com/child.json": {
    "id": "http://example.com/child.json",
    "required": [
      "b"
    ],
    "properties": {
      "b": { "type": "string" }
    }
  }
};

var ajv = Ajv({
  loadSchema: function(uri, callback) {
    setTimeout(function() {
      callback(null, schemas[uri]);
    });
  }
});

ajv.compileAsync(schemas["http://example.com/parent.json"], function(err, validate) {
  console.log(validate({a: { b: "test"} }));
});

ajv.compileAsync(schemas["http://example.com/parent.json"], function(err, validate) {
  console.log(validate({a: { b: "test"} }));
});
```

Which typically results in the exception:

Error: schema with key or id "http://example.com/child.json" already exists
