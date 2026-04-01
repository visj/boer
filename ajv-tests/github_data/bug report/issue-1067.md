# [1067] date-time full format's


**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Latest


**Sample data**

```javascript
const Ajv = require("ajv");


var schema = { format: 'date-time' };
var _Date = '2019-08-19 08:41:27';


var ajv2 = new Ajv({ format: 'full' });
console.log(ajv2.validate(schema, _Date));
```


**What results did you expect?**
true