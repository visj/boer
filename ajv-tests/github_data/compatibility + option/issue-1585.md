# [1585] Can't get version 8.1.0 to run in IE11 

This might be as simple as a one word answer: **"no"**, but I can't find anywhere explicitly stating it.

**The version of Ajv you are using**
8.0.1
**The environment you have the problem with**
Internet Explorer 11
**Your code (please make it as small as possible to reproduce the issue)**
```js
const options = {
  code: { es5: true },
};
const ajv = new Ajv(options);
ajv.compile(schema);
ajv.validate(formData);
```
It breaks on the [`class` declaration](https://github.com/ajv-validator/ajv/blob/master/lib/ajv.ts#L11).

I have tried transpiling it with babel:
```js
module: {
  rules: [
    {
      test: /node\_modules\/.*(ajv)\/.*\.js$/
      use: {
        loader: 'babel-loader',
        options: { presets: '@babel/preset-env' }
      }
    }
  ]
}
```
As well as adding `targets: { ie: '11' }`.
There are various subsequent errors, but eventually I got stuck on it not accepting the `pattern` key in a JSON schema: with or without a RexExp around the [compileSchema function](https://github.com/ajv-validator/ajv/blob/master/lib/compile/index.ts#L164).