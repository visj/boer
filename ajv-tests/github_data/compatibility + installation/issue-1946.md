# [1946] "[ERR_MODULE_NOT_FOUND]: Cannot find module" with NPM workspaces

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.11.0

**Ajv options object**

Empty

**JSON Schema**

```
{
  properties: {
    comment: { type: 'string' },
    status: { type: 'string' },
  },
  additionalProperties: false,
}
```

**Sample data**


[ajv-workspaces-issue](https://github.com/BernhardRode/ajv-workspaces-issue)

# Issue with ajv with npm workspaces

## Preparation

* `git clone https://github.com/BernhardRode/ajv-workspaces-issue.git`
* `cd ajv-workspaces-issue`
* `npm i && npm i -ws`

## Run

* `npm run build -w apps/parser`
* `npm run start -w apps/parser`

## Findings

* change the import "import Ajv from 'ajv/dist/jtd'" to "import Ajv from 'ajv/dist/jtd.js'" in 'apps/parser/src/index.ts'
* build and run - it works but imho this is ugly 😜

## Result

```bash
➜  ajv-test git:(main) ✗ npm run start -w apps/parser

> ajv-parser@1.0.0 start
> node dist/index.js

node:internal/process/esm_loader:94
    internalBinding('errors').triggerUncaughtException(
                              ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/Users/rbo2abt/dev/ajv-test/node_modules/ajv/dist/jtd' imported from /Users/rbo2abt/dev/ajv-test/apps/parser/dist/index.js
Did you mean to import ajv-test/node_modules/ajv/dist/jtd.js?
    at new NodeError (node:internal/errors:372:5)
    at finalizeResolution (node:internal/modules/esm/resolve:413:11)
    at moduleResolve (node:internal/modules/esm/resolve:972:10)
    at defaultResolve (node:internal/modules/esm/resolve:1181:11)
    at ESMLoader.resolve (node:internal/modules/esm/loader:580:30)
    at ESMLoader.getModuleJob (node:internal/modules/esm/loader:294:18)
    at ModuleWrap.<anonymous> (node:internal/modules/esm/module_job:80:40)
    at link (node:internal/modules/esm/module_job:78:36) {
  code: 'ERR_MODULE_NOT_FOUND'
}
```

**What results did you expect?**

```bash
➜  ajv-test git:(main) ✗ npm run start -w apps/parser

> ajv-parser@1.0.0 start
> node dist/index.js

{ data: { comment: 'hello', status: 'ok' } }
unexpected token 1
unexpected token 2
missing required properties
missing required properties
property wrong not allowed
unexpected token 1
```


**Are you going to resolve the issue?**

If i can help, yes.
