# [1111] AJV cant resolve external json file path

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
I am using ajv 6.10.2 and i have two json files in the same folder, the error seems to happen that ajv cant resolve the $ref to another json file.


**Ajv options object**
I have tried those references

https://github.com/epoberezkin/ajv/issues/534
https://github.com/epoberezkin/ajv/issues/561


```javascript


```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->
file 1
```
{
    "$id":"/path/to/file/schema1.json",
    "$schema": "http://json-schema.org/draft-07/schema",
    "$ref": "/path/to/file/schema1.json#/schema1",
    "schema1": {
        "title": "",
        "description": "",
        "type": "object",
        "properties": {
            "name": {
                "description": "",
                "type": "string"
            },
            "properties": {
                "description": "",
                "type": "array",
                "items": {
                    "$id": "/path/to/file/schema2.json",
                    "$ref": "/path/to/file/schema2.json#/schema2" //<- if i delete this it works but i need this
                }
            }
        },
        "required": ["name"]
    }
}
```
and file 2
```
{
    "$id":"/path/to/file/schema2.json",
    "$schema": "http://json-schema.org/draft-07/schema",
    "$ref": "/path/to/file/schema2.json#/schema1",
    "property": {
        "title": "Title",
        "description": "Some description",
        "type": "object",
        "properties": {
            "name": {
                "type": "string",
                "description": "some discription"
            }
        },
        "required": ["name"]
    }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json


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
const fs = require('fs');
let Ajv = require('ajv');
let ajv = new Ajv({allErrors: true, schemaId: 'auto'});
let file1 = JSON.parse(fs.readFileSync("../path/to/file/schema1.json", 'utf8'));
let file2 = JSON.parse(fs.readFileSync("../path/to/file/schema2.json", 'utf8'));
ajvj.addSchema(file2);
ajvj.addSchema(file1);
console.log(ajv.validate(file1, {}), ajv.errors);
//console.log(ajv.validate({}), ajv.errors); // it always returns true
```


**Validation result, data AFTER validation, error messages**

```
Maximum call stack size exceeded
    at String.replace (<anonymous>)
    at _normalizeComponentEncoding (/app/node_modules/uri-js/dist/es5/uri.all.js:790:82)
    at Object.parse (/app/node_modules/uri-js/dist/es5/uri.all.js:936:13)
    at getFullPath (/app/node_modules/ajv/lib/compile/resolve.js:209:15)
    at Ajv.resolveSchema (/app/node_modules/ajv/lib/compile/resolve.js:72:16)
    at Ajv.resolveRecursive (/app/node_modules/ajv/lib/compile/resolve.js:102:27)
    at Ajv.resolveSchema (/app/node_modules/ajv/lib/compile/resolve.js:77:31)
    at Ajv.getJsonPointer (/app/node_modules/ajv/lib/compile/resolve.js:134:35)
    at Ajv.resolveSchema (/app/node_modules/ajv/lib/compile/resolve.js:95:25)
    at Ajv.resolveRecursive (/app/node_modules/ajv/lib/compile/resolve.js:102:27)
/app/node_modules/ajv/lib/ajv.js:350
    throw e;
    ^
```

**What results did you expect?**
I expect true or false, if the json object is correct(true) if it is empty(false)


**Are you going to resolve the issue?**
I am trying to...
