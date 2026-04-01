# [2273] compile a simple 2019-09 schema fails with: no schema with key or ref "${schemaKeyRef}"

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

```
$ npm list --depth=1
└─┬ ajv-cli@5.0.0
  ├── ajv@8.12.0
  ├── fast-json-patch@2.2.1
  ├── glob@7.2.3
  ├── js-yaml@3.14.1
  ├── json-schema-migrate@2.0.0
  ├── json5@2.2.3
  ├── minimist@1.2.8
  └── UNMET OPTIONAL DEPENDENCY ts-node@>=9.0.0
```



**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const Ajv = require("ajv")
const fs = require('fs');

let rawdata = fs.readFileSync('schema.json');
let schema = JSON.parse(rawdata);

const ajv = new Ajv() 
const validate = ajv.compile(schema)
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$schema": "http://json-schema.org/draft/2019-09/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    }
  }
}
```


**Validation result, data AFTER validation, error messages**

```
../node_modules/ajv/dist/core.js:147
                throw new Error(`no schema with key or ref "${schemaKeyRef}"`);
                ^

Error: no schema with key or ref "http://json-schema.org/draft/2019-09/schema"
    at Ajv.validate (../node_modules/ajv/dist/core.js:147:23)
    at Ajv.validateSchema (../node_modules/ajv/dist/core.js:260:28)
    at Ajv._addSchema (../node_modules/ajv/dist/core.js:460:18)
    at Ajv.compile (../node_modules/ajv/dist/core.js:158:26)
    at Object.<anonymous> (../x/validate.js:9:22)
    at Module._compile (internal/modules/cjs/loader.js:999:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1027:10)
    at Module.load (internal/modules/cjs/loader.js:863:32)
    at Function.Module._load (internal/modules/cjs/loader.js:708:14)
    at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:60:12)
```

**What results did you expect?**
A successful compile of the schema

I also tried the following but it did not make a difference

```
const Ajv2019 = require("ajv/dist/2019")
const ajv = new Ajv2019()
``` 


