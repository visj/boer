# [573] Improve error reporting of oneOf

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
ajv@5.2.2


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{
  $data: true,
  allErrors: true,
  jsonPointers: true
}
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$schema": "http://json-schema.org/draft-06/schema",
  "properties": {
    "propA": {
      "type": "string"
    },
    "propB": {
      "type": "string",
      "not": {
        "const": {
          "$data": "1/propA"
        }
      }
    }
  }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
  "propA": "foo",
  "propB": "foo"
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
ajv.validate(schema, data);
```


**Validation result, data AFTER validation, error messages**

```
[ { keyword: 'not',
    dataPath: '.propB',
    schemaPath: '#/properties/propB/not',
    params: {},
    message: 'should NOT be valid' } ]
```

**What results did you expect?**

The error message tells me that `not` is rejected, but the really relevant information would be that `const` was not satisfied.

**Are you going to resolve the issue?**

I will be using a custom error message using the [ajv-errors keyword](https://github.com/epoberezkin/ajv-errors). However, it's not optimal since it increases my configuration overhead.

Would it be possible to increase the verbosity just for the `not:` keyword so the contained `count:` schema becomes visible?
