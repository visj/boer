# [942] Error: custom keyword definition is invalid: data.errors should be boolean

vue.js uses this library and I can't run yarn serve because of the following error:

```
$ yarn serve
yarn run v1.13.0
$ vue-cli-service serve
 INFO  Starting development server...
 ERROR  Error: custom keyword definition is invalid: data.errors should be boolean
Error: custom keyword definition is invalid: data.errors should be boolean
    at Ajv.addKeyword (/Users/youri/code/project/node_modules/ajv/lib/keyword.js:65:13)
    at module.exports (/Users/youri/code/project/node_modules/ajv-errors/index.js:10:7)
    at Object.<anonymous> (/Users/youri/code/project/node_modules/schema-utils/src/validateOptions.js:22:1)
    at Module._compile (internal/modules/cjs/loader.js:734:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:745:10)
    at Module.load (internal/modules/cjs/loader.js:626:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:566:12)
    at Function.Module._load (internal/modules/cjs/loader.js:558:3)
    at Module.require (internal/modules/cjs/loader.js:663:17)
    at require (internal/modules/cjs/helpers.js:20:18)
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
```
