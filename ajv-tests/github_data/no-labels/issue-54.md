# [54] Schema "pattern" keyword does not work properly

Hello, I'm using Node.js v4.1.1 and Ajv v1.4.2

**Test case**

``` javascript
var Ajv = require("ajv"),
    schema =  {
        "type": "object",
        "properties": {
            "name": {
                "type": "string",
                "pattern": "/^\w+$/"
            }   
        }
    };

var ajv = Ajv();
var validate = ajv.compile(schema);
validate({name: "John"}); // returns false
```

**console.log(validate.errors)**

> [ { keyword: 'pattern',
>     dataPath: '.name',
>     message: 'should match pattern "/^w+$/"' } ]
