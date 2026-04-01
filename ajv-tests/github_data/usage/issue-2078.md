# [2078] String maxLength works incorrectly with Hebrew

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Happens on latest *8.11.0* as well as on *8.6.2*

**Ajv options object**

No options passed - default

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "type": "string"
    "maxLength": 24
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
"מענה אנושי👨🏼‍🦰 👱🏽‍♀️"
```

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
var Ajv = require('ajv');
const assert = require('assert');

ajv = new Ajv({
    // options here
});

var schema = {
    type: 'string',
    maxLength: 24,
};

var data = "מענה אנושי👨🏼‍🦰 👱🏽‍♀️";
// String have length == 25
assert.equal(data.length, 25);

var validate = ajv.compile(schema);

console.log(validate(data));
console.log(validate.errors);

```

On RunKit - https://runkit.com/zaporozhec7/630fad1baaf36c000a0376b6

**Validation result, data AFTER validation, error messages**

No errors, but should be

**What results did you expect?**

String do not pass validation, because actually 25 characters long

**Are you going to resolve the issue?**
Not sure yet
