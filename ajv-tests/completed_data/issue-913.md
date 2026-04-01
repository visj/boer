# [913] conditional validation is always true when the properties is `undefined`

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Tried with 6.6.2/latest.

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "object",
  "properties": {
    "A": { "type": "string" },
    "hasA": { "type": "boolean" }
  },
  "if": { "properties": { "hasA": { "enum": [true] } } },
  "then": { "required": ["A"] },
}
```

**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{}
```

Or

```js
{
  "hasA": undefined
}
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
const Ajv = require('ajv');
const ajv = new Ajv;

const validate = ajv.compile(schema);
console.log(validate(data), validate.errors);
```

**Validation result, data AFTER validation, error messages**

```
[ { keyword: 'required',
    dataPath: '',
    schemaPath: '#/then/required',
    params: { missingProperty: '.A' },
    message: 'should have required property \'.A\'' } ]
```

[Runkit link](https://runkit.com/g-ongenae/ajv-issue)

**What results did you expect?**

The object to be valid.

**Are you going to resolve the issue?**

I look forward to it.