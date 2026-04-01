# [339] oneOf will not validate if includes a format

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
4.8.2


**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

```javascript
{
    formats: {
        alphabetic(value) {
            return typeof value === 'string' && /^[a-z]+$/i.test(value);
        }
    }
}
```


**JSON Schema (please make it as small as possible to reproduce the issue):**

```json
{
    "oneOf": [
        { "format": "alphabetic" },
        { "type": "integer" }
    ]
}
```


**Data (please make it as small as posssible to reproduce the issue):**

```json
10
```


**Your code (please use `options`, `schema` and `data` as variables):**

```javascript
let ajv = new AJV({
    formats: {
        alphabetic(value) {
            return typeof value === 'string' && /^[a-z]+$/i.test(value);
        }
    }
});
const validate = ajv.compile({
    "oneOf": [
        { "format": "alphabetic" },
        { "type": "integer" }
    ]
});
validate(10); // —> false
```

<!--
It would help if you post a working code sample in Tonic notebook and include the link here. You can clone this notebook: https://tonicdev.com/esp/ajv-issue.
-->


**Validation result, data AFTER validation, error messages:**

```
[ { keyword: 'oneOf',
    dataPath: '',
    schemaPath: '#/oneOf',
    params: {},
    message: 'should match exactly one schema in oneOf' } ]

```

**What results did you expect?**
value `10` should validate successfully.
Note that this will validate if I don't use the `format` keyword within `oneOf`.

**Are you going to resolve the issue?**
