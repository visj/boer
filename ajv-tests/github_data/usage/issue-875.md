# [875] Key already exists when trying to use draft 7

When trying to use draft 7 in the same way as 6 I get the following error

```
Error: schema with key or id "http://json-schema.org/draft-07/schema" already exists
```

If I change the 7 to a 6 it works fine but I have a need to use draft 7.

This can be reproduced by adding this to the following code to the REPL link in the docs

```
ajv.addMetaSchema(require("ajv/lib/refs/json-schema-draft-07.json"));
```

You can run this at https://runkit.com/njlucyk/ajv-v7

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.5.4, latest version from REPL



**Your code**

```javascript
var Ajv = require('ajv');
var ajv = new Ajv({allErrors: true});
var V7_SCHEMA = require("ajv/lib/refs/json-schema-draft-07.json");
ajv.addMetaSchema(V7_SCHEMA);

var schema = {
  "properties": {
    "foo": { "type": "string" },
    "bar": { "type": "number", "maximum": 3 }
  }
};

var validate = ajv.compile(schema);

test({"foo": "abc", "bar": 2});
test({"foo": 2, "bar": 4});

function test(data) {
  var valid = validate(data);
  if (valid) console.log('Valid!');
  else console.log('Invalid: ' + ajv.errorsText(validate.errors));
}

```


Thanks for the help,
Nathan
