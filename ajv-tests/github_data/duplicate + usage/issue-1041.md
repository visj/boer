# [1041] Feature: return errors from validate

Currently the usage pattern is:
```js
const ajv = new Ajv();
const validate = ajv.compile(schema);
const valid = validate(data);
if (!valid) console.log(validate.errors);
```
there's this global `.errors` property assigned on the validate function

Why not doing this:

```js
const ajv = new Ajv();
const validate = ajv.compile(schema);
const errors = validate(data); // if errors is null, data is valid
if (errors) console.log(errors);
```