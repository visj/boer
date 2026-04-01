# [297] Error when using $data

Hi there! I'm trying to run the example code of:

``` js
'use strict'

var Ajv = require('ajv');
var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
var schema = {
  "properties": {
    "smaller": {
      "type": "number",
      "maximum": { "$data": "1/larger" }
    },
    "larger": { "type": "number" }
  }
};

var data = {
  smaller: 5,
  larger: 7
};
var validate = ajv.compile(schema);
var valid = validate(data);
if (!valid) console.log(validate.errors);
```

But I've got the following error:

``` text
$       node test.js
/home/me/project/node_modules/ajv/lib/ajv.js:164
      else throw new Error(message);
           ^

Error: schema is invalid: data.properties['smaller'].maximum should be number
    at validateSchema (/home/me/project/node_modules/ajv/lib/ajv.js:164:18)
    at _addSchema (/home/me/project/node_modules/ajv/lib/ajv.js:285:7)
    at Ajv.compile (/home/me/project/node_modules/ajv/lib/ajv.js:110:21)
    at Object.<anonymous> (/home/me/project/test.js:19:20)
    at Module._compile (module.js:397:26)
    at Object.Module._extensions..js (module.js:404:10)
    at Module.load (module.js:343:32)
    at Function.Module._load (module.js:300:12)
    at Function.Module.runMain (module.js:429:10)
    at startup (node.js:139:18)
```

Would you please tell me what wrong is?
