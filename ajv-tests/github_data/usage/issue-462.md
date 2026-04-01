# [462] Example in Readme throws error

In the README for this project, we have this example:

```js

let schema = {
  "properties": {
    "smaller": {
      "type": "number",
      "maximum": {
        "$data": "1/larger"
      }
    },
    "larger": {
      "type": "number"
    }
  }
};

let Ajv = require('ajv');
let ajv = new Ajv();
let validate = ajv.compile(schema);
```

but when I run it, I get this error:

```
Error: schema is invalid: data.properties['smaller'].maximum should be number
    at validateSchema (/Users/alexamil/WebstormProjects/oresoftware/npm-link-up/node_modules/ajv/lib/ajv.js:167:18)
    at _addSchema (/Users/alexamil/WebstormProjects/oresoftware/npm-link-up/node_modules/ajv/lib/ajv.js:288:7)
    at Ajv.compile (/Users/alexamil/WebstormProjects/oresoftware/npm-link-up/node_modules/ajv/lib/ajv.js:113:21)
    at Object.<anonymous> (/Users/alexamil/WebstormProjects/oresoftware/npm-link-up/index.js:126:20)
    at Module._compile (module.js:570:32)
    at Object.Module._extensions..js (module.js:579:10)
    at Module.load (module.js:487:32)
    at tryModuleLoad (module.js:446:12)
    at Function.Module._load (module.js:438:3)
    at Module.runMain (module.js:604:10)

```

maybe this is a documentation bug? Not sure what's going on.