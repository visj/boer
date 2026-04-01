# [1058] SyntaxError: Unexpected string

See full stack trace below. Using version 6.10.2 here. Didn't install ajv directly, probably installed by standardjs.

```
/Users/michael-heuberger/code/munge ❯❯❯ yarn run lint                                                                                                                                      ✘ 1 master ✖ ✱ ◼
yarn run v1.16.0
$ standard index.js
/Users/michael-heuberger/code/munge/node_modules/ajv/lib/compile/index.js:121
        'self',
        ^^^^^^

SyntaxError: Unexpected string
    at createScript (vm.js:80:10)
    at Object.runInThisContext (vm.js:139:10)
    at Module._compile (module.js:617:28)
    at Object.Module._extensions..js (module.js:664:10)
    at Module.load (module.js:566:32)
    at tryModuleLoad (module.js:506:12)
    at Function.Module._load (module.js:498:3)
    at Module.require (module.js:597:17)
    at require (internal/module.js:11:18)
    at Object.<anonymous> (/Users/michael-heuberger/code/munge/node_modules/ajv/lib/ajv.js:3:21)
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
```