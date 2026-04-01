# [1640] CSP 'script-src' directive is violated by Function constructor

Hello,

The usage of `Function` constructor violates the 'script-src' directive. Right now, the only workaround is to disable it by setting it's value to `unsafe-eval`.
Line: https://github.com/ajv-validator/ajv/blob/f54f1b7f463b8b71e7e56b9bd2684271810fe977/lib/compile/index.ts#L171

More information about [Unsafe eval expessions](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src#unsafe_eval_expressions).
Are there any plans to refactor it and enable the CSP policy or is there any workaround?