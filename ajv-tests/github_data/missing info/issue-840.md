# [840] possible bug with removeAdditionalProperties: true

Hey, I've been encountering the following error:

```
TypeError: Cannot delete property '0' of [object Uint8Array]\n    at validate (eval at localCompile (/src/node_modules/ms-validation/node_modules/ajv/lib/compile/index.js:120:26), <anonymous>:3:415
```

which is generally produced by:

```js
const validate = this.$ajv.getSchema(schema);
validate(data);
```

I don't have a specific input that produced such an error, nor do I have a specific schema (working on it though). I can't really tell whether it's a bug in ajv or a bug in my code, but my guess is that some arbitrary input goes through `type: object` validation with `removeAdditionalProperties: true` &/or `additionalProperties: false` settings and then caused an error. Because this is sync, I, of course, is able to try/catch it and discover whats going on under the hood, but would ultimately love if you can give me some hints on what you think about the issue and whether cases like this should be handled natively here

Thanks!