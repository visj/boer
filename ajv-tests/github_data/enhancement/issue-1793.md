# [1793] consider removing require-from-string dependency

**What version of Ajv you are you using?**

`master`

**What problem do you want to solve?**

Reducing the number of runtime dependencies.

**What do you think is the correct solution to problem?**

It seems that `require-from-string` is mainly used to provide the `getStandalone` helper method: https://github.com/ajv-validator/ajv/blob/master/lib/standalone/instance.ts#L24.

Since the reference documentation already show an example of how to use `require-from-string` from the ajv client code to perform the same operation https://ajv.js.org/standalone.html#usage-from-code, I wonder if you've considered removing the helper w/ the dependency altogether.

**Will you be able to implement it?**

Of course!
