# [1985] Validate failed: oneOf

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.11.0
**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{
    useDefaults: true,
    coerceTypes: 'array',
    allErrors: true,
    removeAdditional: true,
}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "oneOf": [
    { "type": "null" }, 
    { "type": "integer" }  
  ]
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
null
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
            const ajv = new Ajv({
                useDefaults: true,
                coerceTypes: 'array',
                allErrors: true,
                removeAdditional: true,
            })
            const validate = ajv.compile({
                oneOf: [{ type: 'null' }, { type: 'integer' }],
            })
            validate(null) // false
```

**Validation result, data AFTER validation, error messages**

```javascript
//valid: false
[
  {
    instancePath: '',
    schemaPath: '#/oneOf',
    keyword: 'oneOf',
    params: { passingSchemas: [Array] },
    message: 'must match exactly one schema in oneOf'
  }
]

```

**What results did you expect?**
The result should pass, if you remove the coerceTypes flag, then everything works fine
**Are you going to resolve the issue?**
Not Sure