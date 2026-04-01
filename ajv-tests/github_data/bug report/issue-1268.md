# [1268] addMetaSchema fails for json-schema-draft-04

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Using 5.5.2, tried to upgrade to 6.12.4

This works for 5.5.2 but fails for 6.12.4
```javascript
const ajv = require('ajv');
const metaSchema = require('ajv/lib/refs/json-schema-draft-04.json');

ajv.addMetaSchema(metaSchema); // Fails for 6.12.4
```
Error message is: `no schema with key or ref "http://json-schema.org/draft-04/schema#"`
Stacktrace
```
      Ajv.validate (node_modules/ajv/lib/ajv.js:93:19)
      Ajv.validateSchema (node_modules/ajv/lib/ajv.js:174:20)
      Ajv._addSchema (node_modules/ajv/lib/ajv.js:307:10)
      Ajv.addSchema (node_modules/ajv/lib/ajv.js:137:29)
      Ajv.addMetaSchema (node_modules/ajv/lib/ajv.js:152:8)
```

In `json-schema-draft-04.json`, if I change property "id" to "$id" on line 2 it works.

