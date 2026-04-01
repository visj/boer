# [1825] Working with int64 timestamps (JTD)

I have a timestamp that I need to validate, and in my JSON it looks like this: `"postedOn": 1508689942000,`.

I'm using JTD with Typescript. The data type of this timestamp would be int64, however it looks like this type is not implemented in ajv.
I found a package that implements it - https://ajv.js.org/packages/ajv-formats.html, however it turns out I can't use `formats` keyword with JTD.

I'm stuck, and I can't find anything helpful online. I believe _int64_ is a very common use-case, and I'm surprised to not find any clear guidance on that.