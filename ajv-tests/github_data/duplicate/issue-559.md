# [559] Make `validate` side-effect free / handle Immutable data

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using?**
`5.2.2`, latest at the moment of writing

**The problem you want to solve**
I don't want to modify properties in a different scope, to prevent unwanted side-effects. Side-effects are 
often responsible for causing bugs.

schema:
```js
import Ajv from 'ajv';
import deepFreeze from 'deep-freeze';

var ajv = new Ajv({ useDefaults: true });
var schema = {
  "type": "object",
  "properties": {
    "foo": { "type": "number" },
    "bar": { "type": "string", "default": "baz" }
  },
  "required": [ "foo", "bar" ]
};

var data = deepFreeze({ "foo": 1 });
```

issue:
```js
var validate = ajv.compile(schema);
var isValid = validate(data); // THROW: ​​Can't add property bar, object is not extensible​​

// expected results without `deepFreeze`
console.log(validate.errors); // null
console.log(isValid); // true
console.log(data); // { foo: 1, bar: 'baz' }
```

**What do you think is the correct solution to the problem?**
The correct solution would be to make `ajv` behave side-effect free. Make the `validate` function side-effect free / immutable, don't reassign arguments there.

```js
var validate = ajv.compile(schema);
var result = validate(data);

console.log(result.errors); // null
console.log(result.isValid); // true
console.log(result.data); // { foo: 1, bar: 'baz' }
console.log(data); // { foo: 1 }
```

If `validate` does not modify data, be sure that `result.data === data`. When it does modify data (because of applying defaults, or Coercing data types), `result.data !== data`

**Will you be able to implement it**
At this moment probably not, because of lack of time. Maybe in the future, but don't hold your breath.