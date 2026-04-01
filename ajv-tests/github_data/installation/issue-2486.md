# [2486] Replace `uri-js` abandoned dependency

This is not exactly an installation issue but it may become one.

The uri-js package is unmaintained and abandoned: https://github.com/garycourt/uri-js/issues/96
This is also a kown security issue: https://github.com/ajv-validator/ajv/issues/1978

This dependency should be replaced (maybe with https://github.com/andreinwald/uri-js-replace or maybe with something else).

**The version of Ajv you are using**

`6.12.6`

**Operating system and node.js version**

Reproduce on Linux, MacOS and Windows

**Package manager and its version**

`npm@10.8.2`

**Link to (or contents of) package.json**

uri-js:4.4.1
https://github.com/ajv-validator/ajv/blob/f06766f33ed7291f84c19f22a1286a34475fbdaf/package.json#L108

**Error messages**

Warning message at runtime (will break with future `node` versions):

```
(node:81876) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
```


