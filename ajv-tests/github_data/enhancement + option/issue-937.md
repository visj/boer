# [937] Option to exclude undefined properties from count for min/maxProperties keywords

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.8.1 (latest)

**Ajv options object**
Default options

**JSON Schema**
```json
{
  "type": "object",
  "properties": {
    "a": { "type": "string" }
  },
  "minProperties": 1
}
```

**Sample data**
```javascript
{ "a": undefined }
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
var Ajv = require('ajv');
var ajv = new Ajv();
var validate = ajv.compile(schema);
var valid = validate(data);
console.log(validate(data));
console.log(validate.errors);
```
Working code sample:
https://runkit.com/5c5d4c01295a37001391f035/5c5d4c0a295a37001391f03a

**Validation result, error messages**
```
true // result
null // errors
```

**What results did you expect?**
I expected validation to fail, because of one of the following reasons:
1. `"type": "string"` validation fails, because `a` is not a string
2. `a` property is ignored (because its value is `undefined`), and the data is effectively validated as an empty object `{}`, in which case `"minProperties": 1` validation should fail.

The latter would probably make more sense given how `undefined` object value is handled in other cases. For instance, adding`"required": ["a"]` to the schema would fail the validation.

Is this a bug, or am I missing something?