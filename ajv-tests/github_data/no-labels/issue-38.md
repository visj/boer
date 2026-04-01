# [38] Cannot find module '../dotjs/ref'

The version 1.1.0 release yesterday is causing issues here:

```
Error: Cannot find module '../dotjs/ref'
    at Function.Module._resolveFilename (module.js:338:15)
    at Function.Module._load (module.js:280:25)
    at Module.require (module.js:364:17)
    at require (module.js:380:17)
    at Object.<anonymous> (/Users/ben/SiteTour/projects/api/node_modules/osprey-mock-service/node_modules/osprey/node_modules/osprey-method-handler/node_modules/ajv/lib/compile/_rules.js:5:11)
    at Module._compile (module.js:456:26)
    at Object.Module._extensions..js (module.js:474:10)
    at Module.load (module.js:356:32)
    at Function.Module._load (module.js:312:12)
    at Module.require (module.js:364:17)
```

What do you think - should I ask `osprey-method-handler` to lock AJV version to the old `1.0.x` version, or perhaps AJV can release `1.1.0` as `2.0.0` instead in case other packages may hit the same issue?
