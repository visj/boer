# [59] URN wrongly reported as non-URI

``` js
var Ajv = require('ajv');
var schema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "properties": { "id": { "type": "string", "format": "uri" } }
};
var ajv = Ajv({verbose:1});
var valid  = ajv.compile(schema);

console.log(valid({"id": "urn:isbn:978-3-531-18621-4"}));
console.log(ajv.errorsText());
```

I get the following output

```
false
No errors
```
