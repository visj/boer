# [753] if then validation failing if property is not present

If the property used in the if clause is not present in the validated data then the validation fails with an error about the then clause not being matched.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Using version 6.4.0

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```json
{
  allErrors: true
}
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "object",
  "properties": {
    "foo": { "type": "string" },
    "bar": { "type": "string" }
  },
  "if": {
    "properties": {
      "foo": { "enum": ["bar"] }
    }
  },
  "then": { "required": ["bar"] }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{}
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
var ajv = new Ajv(options);

var validate = ajv.compile(schema);
var valid = validate(data);
if (valid)
  console.log('Valid!');
else
  console.log('Invalid: ' + ajv.errorsText(validate.errors));
```


**Validation result, data AFTER validation, error messages**

```
Invalid: data should have required property 'bar', data should match "then" schema
```

**What results did you expect?**
As the `foo` property is not present, I would expect the if clause to not match and thus having the following output: 
```
Valid!
```

**Are you going to resolve the issue?**
No