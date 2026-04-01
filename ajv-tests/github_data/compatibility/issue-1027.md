# [1027] Errors created without stack

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.10.0 and yes.

It seems that `Ajv` creates subclasses of `Error` in an unusual way that leaves them without a `stack`. May I ask why a simple `extend` of the `Error` class was not used instead? It seems like there is a much better way of doing this that leaves the expected members intact.

This peculiarity adversely affected the Serverless Framework. I have opened an [issue](https://github.com/serverless/serverless/issues/6267) on their side to get them to check that the `stack` member exists before attempting to `split()` it, but this should still be remediated here, too, if possible.

https://github.com/epoberezkin/ajv/blob/ab841b462ec4baff37d2a7319cef13820b53d963/lib/compile/error_classes.js#L5-L15

Then further down:

https://github.com/epoberezkin/ajv/blob/ab841b462ec4baff37d2a7319cef13820b53d963/lib/compile/error_classes.js#L30-L34