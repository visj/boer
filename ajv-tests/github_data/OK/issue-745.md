# [745] Accepts null input as valid.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Version: 6.3.0

**Ajv options object**

{ allErrors: true }

**Your code**

```javascript
const ajv = require('ajv')({ allErrors: true });
const schema = {
  required: ['foo'],
  properties: { foo: { type: 'number' } },
};
const validate = ajv.compile(schema);
validate({foo:5}); // true, as expected
validate({foo:'bar'}); // false, as expected
validate({}); // false -- as expected

validate(null); // true -- not expected!
validate('bar'); // true -- not expected!
validate(0); // true -- not expected!

```

**What results did you expect?**

I expect the validation to return false and produce errors when a string, number, or null value is passed in instead of an object.
