# [2541] `minProperties` and `removeAdditional` does not collaborate well

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

latest (8.17.1)

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{ removeAdditional: "all" }
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->
```json
{
  "type": "object",
  "minProperties": 1,
  "properties": {
    "foo": {
      "type": "string"
    },
    "bar": {
      "type": "string"
    }
  }
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
const shouldError1 = {};
const shouldError2 = { foobar: "baz" };
const shouldPass = { foo: "bar" };
```

**Your code**
**Validation result, data AFTER validation, error messages**

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
const validate = new Ajv(options).compile(schema);

const shouldError1 = {};
console.log(validate(shouldError1), shouldError1); // valid = false, data = {}

const shouldError2 = { foobar: "baz" };
console.log(validate(shouldError2), shouldError2); // valid = true, data = {}

const shouldPass = { foo: "bar" };
console.log(validate(shouldPass), shouldPass); // valid = true, data = { foo: "bar" }
```

**What results did you expect?**

The object with only additional properties is expected to have error for not satisfy the `minProperties` constraint after additional properties has been removed.

**Are you going to resolve the issue?**

Currently not yet.