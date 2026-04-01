# [1146] validateSchema() {"type": "incorrectType"}, Returns Multiple Errors

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.10.2


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
const ajv = new Ajv({
  validateSchema: "log",
  allErrors: true,
  ownProperties: true
});
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{"type": "someIncorrectType"}

```
or 
```json
{"type": 1}

```

**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
var Ajv = require('ajv');

ajv = new Ajv({
    validateSchema: "log",
    allErrors: true,
    jsonPointers: false,
    ownProperties: true
});

var schema = {
    "type": "someIncorrectType"
};

var validate = ajv.validateSchema(schema);

console.log(ajv.errors);

```
RunKit: [https://runkit.com/kentonparton/ajv-issue](https://runkit.com/kentonparton/ajv-issue)

**Validation result, data AFTER validation, error messages**

```
[
  {
    keyword: 'enum',
    dataPath: '.type',
    schemaPath: '#/definitions/simpleTypes/enum',
    params: { allowedValues: [Array] },
    message: 'should be equal to one of the allowed values'
  },
  {
    keyword: 'type',
    dataPath: '.type',
    schemaPath: '#/properties/type/anyOf/1/type',
    params: { type: 'array' },
    message: 'should be array'
  },
  {
    keyword: 'anyOf',
    dataPath: '.type',
    schemaPath: '#/properties/type/anyOf',
    params: {},
    message: 'should match some schema in anyOf'
  }
]

```

**What results did you expect?**
In the case of {"type": "someIncorrectType"} I expected a single error displaying the allowed values, "string", "number" etc. <br/>In the case of {"type": 1}, I expected a single error displaying the allowed types, String or Array.

**Are you going to resolve the issue?**
No