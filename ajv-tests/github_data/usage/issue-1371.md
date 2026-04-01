# [1371] Fails to compile schema when enum has too many values

"ajv": "7.0.2",

**Ajv options object**
Defaults

**JSON Schema**
```json
{
...
"type":"object",
"properties":{
  "large-enum":{
    "type":"string",
    "enum":[... > 1900 values ...]
  }
}

}
```
Real use case enum list can be found at https://github.com/gordonfn/schema/blob/main/src/values/CharacteristicName.legacy.json

**Sample data**
Error compiling schema, NA

**Your code**
```javascript
const schema = {...}
const Ajv = require('ajv').default
const ajv = new Ajv()
const validate = ajv.compile(schema)
```
Full failing example can be found at https://github.com/gordonfn/schema/blob/feature/draft-2019/bin/build.js

**Validation result, data AFTER validation, error messages**

```
Error compiling schema, function code: ...
(node:31228) UnhandledPromiseRejectionWarning: RangeError: Maximum call stack size exceeded
    at new Function (<anonymous>)
    at Ajv.compileSchema (/Users/willfarrell/Development/gordonfn/schema/node_modules/ajv/dist/compile/index.js:88:30)
    at Ajv._compileSchemaEnv (/Users/willfarrell/Development/gordonfn/schema/node_modules/ajv/dist/core.js:441:37)
    at Ajv.compile (/Users/willfarrell/Development/gordonfn/schema/node_modules/ajv/dist/core.js:139:38)
    at process (/Users/willfarrell/Development/gordonfn/schema/bin/build.js:56:24)
```

**What results did you expect?**
I expected it to compile the schema. In ajv v6 compile work with enum length longer than 14000 strings without issue.

**Are you going to resolve the issue?**
I will continue to use ajv v6 for now. Upgrading to draft-2019-09 is not critical for us, but nice to have for the new standalone bundler functionality.