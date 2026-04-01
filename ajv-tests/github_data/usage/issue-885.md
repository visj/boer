# [885] required keyword for empty string

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
{
  allErrors: true,
  jsonPointers: false, 
  coerceTypes: true,
  validateSchema: false
}

```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "object",
  "properties": {
    "test": {
      "type": "string"
    }
  },
  "required": ["test"]
}

```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
  "test": ""
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
  ajv.validate(schema, data)
  console.log(ajv.errors)

```


**Validation result, data AFTER validation, error messages**

```
  the ajv.erros is null

```

**What results did you expect?**
 how can I validate the empty string to use required keyword, or another solution

