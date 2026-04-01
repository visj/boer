# [1312] No schema with key or ref draft-4

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

I have 6.5.2 version.


**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv#options -->

```javascript

const ajv = new Ajv({
    schemaId: 'id', // draft-04 support requirment.
}),
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json

```

**JSON Data**

```json
{
  "properties": {
    "foo": { "type": "string" },
    "bar": { 
      "type": "number", 
      "exclusiveMaximum": true, 
      "maximum": 20,
      "exclusiveMaximum": true,
      "minimum": 1
    }
  }
}
```
**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
const Ajv = require('ajv');
const JSONSchemaDraft4Definition = require('ajv/lib/refs/json-schema-draft-04.json');

var data = {
  "properties": {
    "foo": { "type": "string" },
    "bar": { 
      "type": "number", 
      "exclusiveMaximum": true, 
      "maximum": 20,
      "exclusiveMaximum": true,
      "minimum": 1
    }
  }
};

const options = {schemaId: 'id'};
const ajv = new Ajv({options}).addMetaSchema(JSONSchemaDraft4Definition);
var validate = ajv.compile(data);

test(data);

function test(data) {
  var valid = validate(data);
  if (valid) console.log('Valid!');
  else console.log('Invalid: ' + ajv.errorsText(validate.errors));
}


```


**Validation result, data AFTER validation, error messages**

```
/home/user/workspace/myproject/node_modules/ajv/lib/ajv.js:93
    if (!v) throw new Error('no schema with key or ref "' + schemaKeyRef + '"');
            ^

Error: no schema with key or ref "http://json-schema.org/draft-04/schema#"
    at Ajv.validate (/home/snakuzzo/workspace/mockserver/node_modules/ajv/lib/ajv.js:93:19)
    at Ajv.validateSchema (/home/snakuzzo/workspace/mockserver/node_modules/ajv/lib/ajv.js:174:20)
    at Ajv._addSchema (/home/snakuzzo/workspace/mockserver/node_modules/ajv/lib/ajv.js:307:10)
    at Ajv.addSchema (/home/snakuzzo/workspace/mockserver/node_modules/ajv/lib/ajv.js:137:29)
    at Ajv.addMetaSchema (/home/snakuzzo/workspace/mockserver/node_modules/ajv/lib/ajv.js:152:8)
    at Object.<anonymous> (/home/snakuzzo/workspace/mockserver/prova.js:18:32)
    at Module._compile (internal/modules/cjs/loader.js:1151:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1171:10)
    at Module.load (internal/modules/cjs/loader.js:1000:32)
    at Function.Module._load (internal/modules/cjs/loader.js:899:14)
```

**What results did you expect?**
Maybe I did'nt undestand, but I expect to validate a schema with exclusiveMaximum/exclusiveMinimum and boolean values using draft 04.

**Are you going to resolve the issue?**
