# [1381] ESM module import requires using .default property

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for installation and dependency issues.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md

Before submitting the issue, please try the following:
- use the latest stable Node.js and npm
- use yarn instead of npm - the issue can be related to https://github.com/npm/npm/issues/19877
- remove node_modules and package-lock.json and run install again
-->

**The version of Ajv you are using**: 
v7.0.3

**Operating system and node.js version**
Win10, node 15.5.1

**Package manager and its version**
npm v6.14.10; yarn v1.22.5

**Link to (or contents of) package.json**
```
{
  "name": "ajv-test",
  "version": "1.0.0",
  "description": "",
  "main": "index.mjs",
  "scripts": {
    "app": "node index.mjs"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "ajv": "^7.0.3"
  }
}
```

```
// file: index.mjs
import Ajv from 'ajv';

const ajvValidator = new Ajv();
```

**Error messages**
```
npm run app

> ajv-test@1.0.0 app C:\Users\maik\Projekte\ajv-test
> node index.mjs

file:///C:/Users/maik/Projekte/ajv-test/index.mjs:3
const ajvValidator = new Ajv();
                     ^

TypeError: Ajv is not a constructor
    at file:///C:/Users/maik/Projekte/ajv-test/index.mjs:3:22
    at ModuleJob.run (node:internal/modules/esm/module_job:152:23)
    at async Loader.import (node:internal/modules/esm/loader:166:24)
    at async Object.loadESM (node:internal/process/esm_loader:68:5)
```

**The output of `npm ls`**
```
ajv-test@1.0.0 C:\Users\M.Knebel\Projekte\ajv-test
`-- ajv@7.0.3
  +-- fast-deep-equal@3.1.3
  +-- json-schema-traverse@1.0.0
  +-- require-from-string@2.0.2
  `-- uri-js@4.4.0
    `-- punycode@2.1.1
```

When i downgrade to v6.x.x everything works fine. I also tried yarn for package installation, deleted node_modules and setup a new project to avoid conflicts from other code.
