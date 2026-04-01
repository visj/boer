# [70] Local hash ref with remote hash ref that has inner hash ref (e.g. swagger api schema)

### Affects version 1.4.8
### Reproduce
- run the following code: 
  
  ``` js
  'use strict'
  
  var fs = require('fs');
  
  var Ajv = require('ajv');
  var ajv = Ajv({jsonPointers: true, allErrors: true, verbose: true});
  
  function readFile (filePath) {
    return fs.readFileSync(filePath, 'utf8');
  }
  
  // Schema
  var schemaName = process.argv[2];
  var schema = JSON.parse(readFile(schemaName));
  
  var validate = ajv.compile(schema);
  ```
- with the schema file containing the schema at `https://raw.githubusercontent.com/swagger-api/swagger-spec/master/schemas/v2.0/schema.json`
### Error

```
node testJsonSchemaExternal.js /path/to/schema.json 
/home/cyp/node_modules/ajv/lib/dotjs/ref.js:81
        throw $error;
        ^

Error: can't resolve reference #/definitions/positiveInteger from id http://swagger.io/v2/schema.json#
    at Object.generate_ref [as code] (/home/cyp/node_modules/ajv/lib/dotjs/ref.js:78:22)
    at Object.generate_validate [as validate] (/home/cyp/node_modules/ajv/lib/dotjs/validate.js:43:35)
    at Object.generate_allOf [as code] (/home/cyp/node_modules/ajv/lib/dotjs/allOf.js:24:26)
    at generate_validate (/home/cyp/node_modules/ajv/lib/dotjs/validate.js:43:35)
    at localCompile (/home/cyp/node_modules/ajv/lib/compile/index.js:35:24)
    at Ajv.compile (/home/cyp/node_modules/ajv/lib/compile/index.js:27:10)
    at Ajv.localCompile (/home/cyp/node_modules/ajv/lib/compile/index.js:33:22)
    at Ajv.resolve (/home/cyp/node_modules/ajv/lib/compile/resolve.js:43:19)
    at Object.resolveRef (/home/cyp/node_modules/ajv/lib/compile/index.js:98:21)
    at Object.generate_ref [as code] (/home/cyp/node_modules/ajv/lib/dotjs/ref.js:33:22)
```
