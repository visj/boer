# [1754] import of Standalone module in ESM module requires using .default property

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
`v8.6.2`

**Your code**
[Sandbox](https://codesandbox.io/s/typescript-node-forked-rsymo?file=/src/index.ts)

```javascript
import Ajv from "ajv";
import standalone from "ajv/dist/standalone/index.js";
const ajv = new Ajv();
const validate = ajv.compile({ type: "number", maximum: 5 });

const schema_compiler: string = standalone(ajv, validate);
```
**Validation result, data AFTER validation, error messages**

```
TypeError: standalone is not a function
    at file:///sandbox/src/index.ts:6:13
    at ModuleJob.run (internal/modules/esm/module_job.js:170:25)
    at async Loader.import (internal/modules/esm/loader.js:178:24)
    at async Object.loadESM (internal/process/esm_loader.js:68:5)
```

**What results did you expect?**
I should be able to import `standalone` module without using `.default` property


**Are you going to resolve the issue?**
This one is very similar to #1381. If required, I can create a PR to add `module.exports = exports = standaloneCode` for `lib/standalone/index.ts`

