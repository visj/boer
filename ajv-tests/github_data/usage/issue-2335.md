# [2335] ajv not reading my schema

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "project",
  "description": "A project",
  "type": "object",
  "properties": {
    "project_id": {
      "description": "the id of the project",
      "type": "string",
      "format": "uuid"
    }
  }
}

```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "project_id": "foo"
}

```

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
#!/usr/bin/env node
const Ajv = require("ajv");
const fs = require('fs');

const instanceFilename = process.argv[2];
const schemaFilename = process.argv[3];

const schema = JSON.parse(fs.readFileSync(schemaFilename, 'utf8'));
const instance = JSON.parse(fs.readFileSync(instanceFilename, 'utf8'));

const ajv = new Ajv()

const validate = ajv.compile(schema)
const valid = validate(instance)
if (!valid) console.log(validate.errors)

```

**Validation result, data AFTER validation, error messages**

```
                throw new Error(`no schema with key or ref "${schemaKeyRef}"`);
                ^

Error: no schema with key or ref "https://json-schema.org/draft/2020-12/schema"
    at Ajv.validate (/home/doebi/repos/DCS/engicloud-documentation/specs/node_modules/ajv/dist/core.js:147:23)
    at Ajv.validateSchema (/home/doebi/repos/DCS/engicloud-documentation/specs/node_modules/ajv/dist/core.js:260:28)
    at Ajv._addSchema (/home/doebi/repos/DCS/engicloud-documentation/specs/node_modules/ajv/dist/core.js:460:18)
    at Ajv.compile (/home/doebi/repos/DCS/engicloud-documentation/specs/node_modules/ajv/dist/core.js:158:26)
    at Object.<anonymous> (/home/doebi/repos/DCS/engicloud-documentation/specs/validate.js:13:22)
    at Module._compile (node:internal/modules/cjs/loader:1256:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1310:10)
    at Module.load (node:internal/modules/cjs/loader:1119:32)
    at Module._load (node:internal/modules/cjs/loader:960:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)


```

**What results did you expect?**

i want to write myself a validator to be able to develop my schema and validate it on the go against my testdata. With the current data I want it to fail because project_id is not of format uuid. The python validator i used previously didn provide this functionality, and ajv doesnt even seem to know of 2020-12

**Are you going to resolve the issue?**
