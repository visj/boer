# [1299] "useDefaults" Doesn't populate arrays unless they exist

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

I am using AJV version 6.12.5 with node.js version 12.18.4

**Bug description**

I want to populate an Array with values and create them if they don't exist, using the "useDefaults: true" parameter. Arrays are not populated unless they are initialy created.

**Your code**

```javascript
const Ajv = require('ajv');

var schema = {
    "properties": {
        "owner_list": {
            "type": "array",
            "items": [
                {
                    "type": "string",
                    "default": "test"
                }
            ]
        },
        "required": [ "owner_list"]
    }
}

var data = {};
var ajv = new Ajv({ useDefaults: true });
var validate = ajv.compile(schema);
console.log(validate(data)); // true
console.log(data); // Data is {}, expected to be { owner_list: [ 'test' ] }
```
However if i populate my initial object with an array, like so, it is populated with values :

```javascript
/* ... */
var data = {owner_list :[]}; // changed the initial object to include an array
var ajv = new Ajv({ useDefaults: true });
var validate = ajv.compile(schema);
console.log(validate(data)); // true
console.log(data); // Data is now { owner_list: [ 'test' ] }
```

**What results did you expect?**

The object should be populated with the array and values if it doesn't exist. Regular values are behaving this way. Also the documentation at https://github.com/ajv-validator/ajv#assigning-defaults seems to indicate it should work this way (sorry if I 
misinterpreted something)

**Are you going to resolve the issue?**

I am going to find a workaround for my code, however I don't know if I'm competent enough to improve AJV.