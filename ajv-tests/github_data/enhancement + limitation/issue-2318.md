# [2318] Allow it to work on edge (e.g. cloudflare workers)

Currently AJV can't run on cloudflare workers, vercel-edge and other edge environments. 
When trying to run it, the worker throws an error: 

```
Code generation from strings disallowed for this context
```

Most likely this is because they restrict certain JavaScript functions like `eval(), new Function(), setTimeout([string])`, and `setInterval([string])`, which can execute code generated from strings.

I'm not sure why these functions are needed but it would be better to avoid them so that it could run everywhere without issues.