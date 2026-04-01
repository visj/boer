# [1109]  Maximum call stack size exceeded


**What version of Ajv are you using? Does the issue happen if you use the latest version?**
I am using the latest version of ajv.
The project structure is **src/schemas/schemaA.json** and **src/scripts/app.js**


**Ajv options object**
I have read those links:
https://github.com/epoberezkin/ajv/issues/802
https://github.com/epoberezkin/ajv/issues/801
https://github.com/epoberezkin/ajv/issues/877
<!-- See https://github.com/epoberezkin/ajv#options -->

```
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->
I have a json file schemaA.json
```
{
    "$id":"/path/to/file/schemaA.json",
    "$schema": "http://json-schema.org/draft-07/schema",
    "$ref": "/path/to/filer/schemaA.json",
    "schemaA": {
        "title": "P&ID Node Symbol",
        "description": "schemaA description",
        "type": "object",
        "properties": {
            "depiction": {
                "type": "string",
                "description": "another description"
            }
        },
        "required": ["depiction"]
    }
}
```


**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->
For testing it is just a empty object or sometimes a simple example
```
{}
//
{
    "data":"123"
}

```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```
let Ajv = require('ajv');
let ajv = new Ajv({allErrors: true, schemaId: 'auto'});
let jsh = JSON.parse(fs.readFileSync("../src/server/schemas/nodeSymbol.json", 'utf8'));
ajv.addSchema(jsh);
// In a class method i use
async classmethod(req, res)
{
        //...other code not related to ajv
        let validate = ajv.compile(this.jsonschema);
        let v = validate({}); // here happens the error
        console.log(v)
        //..other code not related to ajv
}
```


**Validation result, data AFTER validation, error messages**

```
UnhandledPromiseRejectionWarning: RangeError: Maximum call stack size exceeded
    at callValidate (/app/node_modules/ajv/lib/ajv.js:1:1)
    at validate (eval at localCompile (/app/node_modules/ajv/lib/compile/index.js:120:26), <anonymous>:3:221)
    at callValidate (/app/node_modules/ajv/lib/ajv.js:368:28)
    at validate (eval at localCompile (/app/node_modules/ajv/lib/compile/index.js:120:26), <anonymous>:3:221)


```

**What results did you expect?**
I expect true or false when i try to validate it. I tried with compileAsync too but still the same problem.
Ps. I cant change the label to green

**Are you going to resolve the issue?**
