# [889] missing file

In the last v6.6.0 release, there is a missing file:

``` 
Error: Cannot find module 'ajv/lib/compile/equal'
    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:603:15)
    at Function.Module._load (internal/modules/cjs/loader.js:529:25)
    at Module.require (internal/modules/cjs/loader.js:658:17)
    at require (internal/modules/cjs/helpers.js:22:18)
    at Object.<anonymous> (/home/travis/build/fastify/fastify/node_modules/table/dist/validateConfig.js:2:13)
    at Module._compile (internal/modules/cjs/loader.js:722:30)
    at Module.replacementCompile (/home/travis/build/fastify/fastify/node_modules/nyc/node_modules/append-transform/index.js:58:13)
    at Module._extensions..js (internal/modules/cjs/loader.js:733:10)
    at Object.<anonymous> (/home/travis/build/fastify/fastify/node_modules/nyc/node_modules/append-transform/index.js:62:4)
    at Module.load (internal/modules/cjs/loader.js:620:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:560:12)
    at Function.Module._load (internal/modules/cjs/loader.js:552:3)
    at Module.require (internal/modules/cjs/loader.js:658:17)
    at require (internal/modules/cjs/helpers.js:22:18)
    at Object.<anonymous> (/home/travis/build/fastify/fastify/node_modules/table/src/makeConfig.js:3:1)
    at Module._compile (internal/modules/cjs/loader.js:722:30)
```

See https://travis-ci.org/fastify/fastify/jobs/461147572
and https://github.com/fastify/fastify/issues/1281.
