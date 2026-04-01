# [2491] Allow it to work on edge (e.g. cloudflare workers)


There is already an issue for this , https://github.com/ajv-validator/ajv/issues/2318, but it is closed. Suggestion there is not working when ajv is XX-layers down like eg: [async-parser](https://github.com/asyncapi/parser-js) -> [@stoplight/spectral](https://github.com/stoplightio/spectral)->ajv and dynamic schema is validated, there is not visible to generate and pass validation function all the way down.



**The version of Ajv you are using**
latest

**The environment you have the problem with**
cloudflare worker

**Your code (please make it as small as possible to reproduce the issue)**
standard example from async-parser [Example](https://github.com/asyncapi/parser-js?tab=readme-ov-file#example-with-parsing)

Works in every browser and node env, except of cloudflare worker. 

**Results and error messages in your platform**
```
 Code generation from strings disallowed for this context

      at new Function (<anonymous>)
      at m.f
```

If there is no way to drop `new Function` usage in general, maybe it could be made conditional? let's say if `option.workerSafe` is passed as true, do something worker safe instead of new function? 
