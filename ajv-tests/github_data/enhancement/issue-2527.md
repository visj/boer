# [2527] Separate `eval` (`new Function`) from `sourceCode` generation (`CodeGen`)

### What version of Ajv are you using?  
8.17.1

### What problem do you want to solve?  

Currently, using AJV on sites with Content Security Policy (CSP) rules that disallow `unsafe-eval` is not feasible due to its reliance on `new Function`. This limitation is documented here: https://ajv.js.org/security.html#content-security-policy  

And the suggested approach around this limitation is a two-step process:  
1. Generate the `sourceCode` for the schema validation.  
2. Serve the `sourceCode` as a standard `.js` file, which can then be included alongside other JavaScript assets on the site.  

However, unfortunately, **purely doing the first step—JUST generating the `sourceCode`—is currently impossible too**. Because `compileSchema()` generates the `sourceCode` but immediately attempts to create the `validate` function using `new Function()`, which violates CSP rules:  

https://github.com/ajv-validator/ajv/blob/82735a15826a30cc51e97a1bbfb59b3d388e4b98/lib/compile/index.ts#L167-L172  

While in this two-step process, **the `validate` function isn't needed at all**, during the first step. (Additionally, this is an extra work).

And the problem is in our case, we do the job in a service-worker which is subject to CSP regulations itself and so it can't execute `eval()` (or `new Function()`).

### What do you think is the correct solution to the problem?  

Introduce a dedicated, pure function that generates only the `sourceCode`. This function should work independently of `compileSchema` and should not attempt to create a `validate` function. Such a function would be compatible with CSP-bound environments and could be used by both `compileSchema` and developers needing `sourceCode` generation.

### Will you be able to implement it?  
Probably yes.