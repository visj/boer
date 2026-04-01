# [1385] v7: addKeyword custom error code example not work

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
7.0.3 (it is the latest now)

**Ajv options object**
```javascript
{
  $data: true,
}
```

**JSON Schema**
```javascript
{
  type: 'object',
  properties: {
    evenNum: {
      type: 'number',
      even: true,
    },
  },
}
```

**Sample data**

```javascript
{
  evenNum: 1,
}
```

**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
'use strict';

const { default: Ajv, _ } = require('ajv');

const validator = new Ajv(options);

validator
  // copy from doc https://github.com/ajv-validator/ajv/blob/master/docs/keywords.md
  .addKeyword({
    keyword: 'even',
    type: 'number',
    schemaType: 'boolean',
    code(cxt) {
      const { data, schema } = cxt;
      const op = schema ? _`!==` : _`===`;

      cxt.fail(_`${data} %2 ${op} 0`);
    },
  });

validator.validate(schema, data);

console.log(validator.errors);

```

**Validation result, data AFTER validation, error messages**

```javascript
[
  {
    keyword: 'even',
    dataPath: '/evenNum',
    schemaPath: '#/properties/evenNum/even',
    params: {},
    message: 'should pass "even" keyword validation'
  }
]
```

**What results did you expect?**
```
[
  {
    keyword: 'even',
    dataPath: '/evenNum',
    schemaPath: '#/properties/evenNum/even',
    params: {},
    message: '1 %2 !== 0'
  }
]
```

**Are you going to resolve the issue?**
No