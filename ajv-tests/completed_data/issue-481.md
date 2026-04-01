# [481] Url validation failed

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
ajv@5.0.1


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{allErrors: true}
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{ 
 "type": "string",
 "format": "url"
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
'http://localhost:3000/#test'

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
let Ajv = require('ajv')
let v = new Ajv(options)
v.validate(scheme, data);
console.log(v.errors);
```


**Validation result, data AFTER validation, error messages**

```
[ { keyword: 'format',
    dataPath: '',
    schemaPath: '#/format',
    params: { format: 'url' },
    message: 'should match format "url"' } ]

```

**What results did you expect?**
It is a correct URL

**Are you going to resolve the issue?**
nope