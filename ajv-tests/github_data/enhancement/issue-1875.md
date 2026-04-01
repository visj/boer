# [1875] Built-in support for type function

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
8.9.0

**What problem do you want to solve?**
No built-in support to allow functions in type

**What do you think is the correct solution to problem?**
Add a type definition for functions

**Will you be able to implement it?**
I have tried to follow the docs for custom keywords but as I have almost no experience with TypeScript I am having trouble. I couldn't really find a better place to post but if there is I will re-post there.

Here is my expected behavior:
```
const AJV = require('ajv');
const ajv = new AJV();

// If needed, keyword code here

const validate = ajv.compile({
   type: 'function'
});

const f1 = () => {};
const f2 = 'I am not a function';

console.log(validate(f1)); // output --> true
console.log(validate(f2)); // output --> false
```

Thank you!
