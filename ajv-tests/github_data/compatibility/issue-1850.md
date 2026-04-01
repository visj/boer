# [1850] in (Deno or browsers) and (skypack or esm.sh), standalone compilation fails on recursive schemas 

This report appears specific to using (either of) skypack or esm.sh to get a ES6 module version of ajv. I see the issue in both Deno v1.16.4 and Chrome 96.0.4664.110 (on OS X, though I doubt that matters).

Specifically, a call to `safeStringify` in the codegen step appears to find a circular structure, causing the generation to fail. On node.js environments, that doesn't happen.

**The version of Ajv you are using**
8.8.2

**The environment you have the problem with**
Deno or browser, using the library as packaged by skypack, esm.sh.

**Your code (please make it as small as possible to reproduce the issue)**
A minimal example is here. This works on node 17, fails on Deno 1.16
https://runkit.com/cscheid/ajv-non-issue

**Results in node.js v8+**
In node.js, the standalone source is generated without a problem.

**Results and error messages in your platform**
There is a runtime error:

```
> const moduleSrc = standalone(ajv, { "navigation-item": "navigation-item" })
    --> starting at object with constructor 'SchemaEnv'
    |     property 'refs' -> object with constructor 'Object'
    --- property 'navigation-item' closes the circle
    at JSON.stringify (<anonymous>)
    at safeStringify (https://cdn.skypack.dev/-/ajv@v8.8.2-oHh4dWmHmt5cH6zohUYk/dist=es2019,mode=imports/unoptimized/dist/compile/codegen/code.js:138:17)
    at interpolate (https://cdn.skypack.dev/-/ajv@v8.8.2-oHh4dWmHmt5cH6zohUYk/dist=es2019,mode=imports/unoptimized/dist/compile/codegen/code.js:131:78)
    at addCodeArg (https://cdn.skypack.dev/-/ajv@v8.8.2-oHh4dWmHmt5cH6zohUYk/dist=es2019,mode=imports/unoptimized/dist/compile/codegen/code.js:91:17)
    at Object._ (https://cdn.skypack.dev/-/ajv@v8.8.2-oHh4dWmHmt5cH6zohUYk/dist=es2019,mode=imports/unoptimized/dist/compile/codegen/code.js:66:7)
    at refValidateCode (https://cdn.skypack.dev/-/ajv@v8.8.2-oHh4dWmHmt5cH6zohUYk/dist=es2019,mode=imports/unoptimized/dist/standalone/index.js:63:35)
    at https://cdn.skypack.dev/-/ajv@v8.8.2-7PXBFgVwJaIVYRDIomxs/dist=es2019,mode=imports/optimized/ajv.js:287:76
    at Set.forEach (<anonymous>)
    at ValueScope._reduceValues (https://cdn.skypack.dev/-/ajv@v8.8.2-7PXBFgVwJaIVYRDIomxs/dist=es2019,mode=imports/optimized/ajv.js:279:12)
    at ValueScope.scopeCode (https://cdn.skypack.dev/-/ajv@v8.8.2-7PXBFgVwJaIVYRDIomxs/dist=es2019,mode=imports/optimized/ajv.js:266:19)
```

I suspect the answer here to be that there's a miscompilation somewhere in both esm.sh and skypack.dev. It is somewhat unfortunate, though, because ajv itself works excellently in skypack. It would be fantastic to be able to work around this issue if anyone knows how to do that.