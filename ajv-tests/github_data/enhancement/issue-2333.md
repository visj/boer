# [2333] Allow pattern to also work with number/integer type

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
Latest: 8.12.0

**What problem do you want to solve?**
`pattern` prop is ignored if type is `number` for example

**What do you think is the correct solution to problem?**
`pattern` should still be used, as for example `regex.test(value)` works if value is a string or number, it's automatically stringified

**Will you be able to implement it?**
probably

**Code summary**
```js
const Ajv = require('ajv').default;

const ajv = new Ajv({
  coerceTypes: true,
});
const schema = {
  type: 'object',
  properties: {
    price: {
      type: 'number',
      pattern: '^-?\\d+(\\.\\d{1,2})?$'
    }
  }
};
// this shouldn't be valid, yet it is
console.log(
  ajv.validate(schema, { price: '123.005' }),
  ajv.errors,
);
```

Of course it's possible to add a custom keyword to get it working, but would be great if it works in the core