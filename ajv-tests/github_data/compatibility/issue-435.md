# [435] Unable to resolve module url from node_modules/ajv/lib/compile/resolve.js

![simulator screen shot mar 10 2017 15 46 54](https://cloud.githubusercontent.com/assets/7754193/23799395/b62b72d8-05a8-11e7-862e-b4dfbf370a2d.png)
I tried using Ajv in a React Native app, however I wasn't even able to include the module (see the screenshot). I tried the stable version, as well as 5.0.3-beta, same thing happens. I used the code example in the docs:

```
var Ajv = require('ajv');
var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
var validate = ajv.compile(schema);
var valid = validate(data);
if (!valid) console.log(validate.errors);
```
But like the error says, I wasn't able to validate anything, it was failing even before with the require('ajv') statement.