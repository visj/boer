# [835] exclusiveMinimum is supposed to be boolean. Error: "exclusiveMinimum should be number"

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



**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
6.5.2

```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json

var schema = {
  "type": "object",
  "title": "empty object",
  "properties": {
    "field_1": {
      "type": "integer",
      "minimum": 1,
      "maximum": 4,
      "exclusiveMinimum": true
    }
  }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json

var data = {
  "field_1": 2
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
var ajv = new Ajv({schemaId: 'auto'});
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));



```


**Validation result, data AFTER validation, error messages**

```
 else throw new Error(message);
         ^

Error: schema is invalid: data.properties['field_1'].exclusiveMinimum should be number

```

**What results did you expect?**


**Are you going to resolve the issue?**
