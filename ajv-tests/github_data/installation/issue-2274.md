# [2274] documentation steps on Parsing and serializing JSON comes with error


I try to follow these steps from [Parsing and serializing JSON](https://ajv.js.org/guide/getting-started.html) and I got error about ajv .

**The version of Ajv you are using**
6 I install with 

**Operating system and node.js version**
Node.js v18.13.0.

**Package manager and its version**
npm -v
9.6.2

**Link to (or contents of) package.json**
{
  "name": "ajv001",
  "version": "1.0.0",
  "description": "simple test with ajv and json ",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "node index.js"
  },
  "keywords": [
    "catafest",
    "json",
    "ajv",
    "nodejs"
  ],
  "author": "catafest",
  "license": "ISC",
  "dependencies": {
    "ajv": "^6.12.6"
  },
  "type": "module"
}

**Error messages**
node:internal/errors:491
    ErrorCaptureStackTrace(err);
    ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'F:\ajv001\node_modules\ajv\dist\jtd' imported from F:\ajv001\index.js
    at new NodeError (node:internal/errors:400:5)
    at finalizeResolution (node:internal/modules/esm/resolve:326:11)
    at moduleResolve (node:internal/modules/esm/resolve:945:10)
    at defaultResolve (node:internal/modules/esm/resolve:1153:11)
    at nextResolve (node:internal/modules/esm/loader:163:28)
    at ESMLoader.resolve (node:internal/modules/esm/loader:842:30)
    at ESMLoader.getModuleJob (node:internal/modules/esm/loader:424:18)
    at ModuleWrap.<anonymous> (node:internal/modules/esm/module_job:77:40)
    at link (node:internal/modules/esm/module_job:76:36) {
  code: 'ERR_MODULE_NOT_FOUND'
}

Node.js v18.13.0

**The output of `npm ls`**
>npm ls
ajv001@1.0.0 F:\ajv001
└── ajv@6.12.6