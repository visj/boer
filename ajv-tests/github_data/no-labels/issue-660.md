# [660] Avoid RangeError: Maximum call stack size exceeded

Let's say I have 150 schemas that I need to use for input validation of my application.
I did try with asyncCompile but it doesn't work.
addSchema method doesn't compile the added schemas.
There is a way to precompile all my 150 schemas before validating and avoid Maximum call stack error?