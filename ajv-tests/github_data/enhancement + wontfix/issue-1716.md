# [1716] Include details on failing "not" conditions in error messages/params

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

Currently subschemas defined in `"not"` keywords do not provide any details on fields, that must not exist on an object. I'd expect something similar to the error message provided for additionalProperties with `additionalProperties` set to `true`.

example (reproduction: https://stackblitz.com/edit/js-6tzy3g)

```js
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

const validate = ajv.compile({
  type: 'object',
  not: {
    required: ['badProperty']
  }
});

validate({
  badProperty: 'exists'
});

// message: must NOT be validate
// params: {}

// would be nice, if params could contain
// '"badProperty" must NOT exist on object'
console.log(validate.errors);

```

**What version of Ajv you are you using?**
8.6.2

**What problem do you want to solve?**
Missing information about why a "not" condition fails

**What do you think is the correct solution to problem?**
I believe it is hard to reason about this feature, since it involves much more than required fields and could get complicated very quickly. But nevertheless it would be cool to show that a property is explicitly not wanted here

**Will you be able to implement it?**
with some guidance, yes
