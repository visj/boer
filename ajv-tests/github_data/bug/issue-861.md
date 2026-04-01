# [861] propertyNames with empty schema prevents validation of all keywords to be validated after it.

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
v6.5.3


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
const options = {
  // allErrors: true,
  coerceTypes: 'array',
  ownProperties: true
};
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "test.json",
  "type": "object",
  "additionalProperties": {
    "type": "array",
    "items": {"type": "string"},
    "uniqueItems": true
  },
  "propertyNames": {}
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{"foo": "abc"}
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

https://runkit.com/embed/xz907r79pjza

```javascript
const Ajv = require('ajv');
const assert = require('assert').strict;
const ajv = new Ajv(options);
const validate = ajv.compile(schema);

test({foo: 'abc'}, {foo: ['abc']});

function test(data, expected) {
  const valid = validate(data);

  if (valid) {
    try {
      assert.deepStrictEqual(data, expected);
    } catch (e) {
      console.log(e);
    }
  }
}
```


**Validation result, data AFTER validation, error messages**

```
// Validation succeeds
{foo: 'abc'}
```

**What results did you expect?**
For the value to be coerced to an array. `{foo: ['abc']}`

It appears this issue only occurs if `propertyNames ` is an empty object. If anything is set (e.g. `{enum: ['foo']}`) then it will coerce the value to an array. OR another approach with the empty `propertyName` object is to enable the `allErrors` options.

**Are you going to resolve the issue?**
Not at this time.