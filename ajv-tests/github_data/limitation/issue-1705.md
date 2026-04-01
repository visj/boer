# [1705] Windows: `Maximum call stack size exceeded` when number of items in `anyOf` is more than 1700

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for compatibility issues.
For other issues please see https://ajv.js.org/contributing/
-->

I have a schema where one of the field `km04` is having 1700+ options, whenever I am trying to validate the object send from client, with 1700+ options for the `km04` field, it is specifically throwing an error in windows for `Maximum call stack`, this error is not replicable in mac, or even in windows if we reduce the number of options available for the `km04` field below 1700.

here is the sample schema,
[schema.txt](https://github.com/ajv-validator/ajv/files/6854268/schema.txt)


**The version of Ajv you are using**
`6.12.3`

**The environment you have the problem with**
`Windows`

**Your code (please make it as small as possible to reproduce the issue)**
`ajv.validate(schema, body);`

**If your issue is in the browser, please list the other packages loaded in the page in the order they are loaded. Please check if the issue gets resolved (or results change) if you move Ajv bundle closer to the top**
It is not in browser

**Results in node.js v8+**
Maximum call stack size exceeded

**Results and error messages in your platform**
```
Maximum call stack size exceeded

\node_modules\\ajv\\lib\\compile\\index.js:120:26)
   at Ajv.compile (\node_modules\\ajv\\lib\\compile\\index.js:55:13)
   at Ajv._compile (\node_modules\\ajv\\lib\\ajv.js:348:27)
   at Ajv.validate (\node_modules\\ajv\\lib\\ajv.js:96:36)
```