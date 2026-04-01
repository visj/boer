# [1274] Type null does not validate when inside of a oneOf type with other types

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.12.2, still present in latest (6.12.4)

**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv#options -->

```javascript
{}
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "properties": {
    "content": {"oneOf": [{}, { "type": "null" }]},
  }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{"content": null}
```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

From REPL runkit

```javascript
var Ajv = require('ajv');
var ajv = new Ajv({allErrors: true});

var schema = {
  "properties": {
    "content": {oneOf: [{}, {type: "null"}]},
  }
};

var validate = ajv.compile(schema);

test({"content": null});


function test(data) {
  var valid = validate(data);
  if (valid) console.log('Valid!');
  else console.log('Invalid: ' + ajv.errorsText(validate.errors));
}
```


**Validation result, data AFTER validation, error messages**

```
"Invalid: data.content should match exactly one schema in oneOf"
```

**What results did you expect?**

Should be valid

Using `{type: "null"}` or `{oneOf: [{type: "null"}]}` works fine, but as soon as we add more types in the `oneOf` it does not validate

**Are you going to resolve the issue?**

I'm afraid not.