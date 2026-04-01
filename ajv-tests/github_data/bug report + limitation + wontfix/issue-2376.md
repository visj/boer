# [2376] Unexpected behavior with removeAdditional and minProperties

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
ajv@8.12.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{
  removeAdditional: true
}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "additionalProperties": false,
  "minProperties": 1,
  "type": "object",
  "properties": {
    "good": {
      "type": "string"
    }
  },
  "required": []
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{ "bad": "will be removed" }
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
const Ajv = require("ajv");
const ajv = new Ajv(options);

const validate = ajv.compile(schema);

console.log(validate(data));
console.log(validate.errors);
console.log(data);
```

Working code sample:
https://runkit.com/vladislao/65c2a14a50acdd0009747ee5

**Validation result, data AFTER validation, error messages**

```
true
null
{}
```

**What results did you expect?**

The validation is expected to fail given the constraints of minProperties: 1 and additionalProperties: false. While it may be apparent in isolated examples that removing properties can lead to such behavior, the issue becomes less obvious when Ajv is used indirectly, such as in Fastify where Ajv is the default validation tool. This situation can easily lead to errors, allowing empty objects to slip through the validation process and potentially causing unexpected behavior and security issues in applications.

Related to https://github.com/fastify/fastify/issues/5104
