# [375] Issue with format and oneOf

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
4.10.0


**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

```javascript
ajv.addFormat('numeric', v => {
  return !isNaN(parseFloat(v)) && isFinite(v)
})

```


**JSON Schema (please make it as small as possible to reproduce the issue):**

```js
{
      type: 'object',
      additionalProperties: false,
      required: [
        'id',
      ],
      properties: {
        id: {
          oneOf: [
            { format: 'numeric' },
            { type: 'array', items: { format: 'numeric' } },
          ]
        },
      }
    }
```


**Data (please make it as small as posssible to reproduce the issue):**

```js
{ id: ['1', '2'] }

```


**Your code (please use `options`, `schema` and `data` as variables):**

```javascript
/* eslint-env mocha */
const assert = require('assert')
const Ajv = require('ajv')
const ajv = new Ajv()

ajv.addFormat('numeric', v => {
  return !isNaN(parseFloat(v)) && isFinite(v)
})

describe('ajv lib', () => {
  it('oneOf', () => {
    const validator = ajv.compile({
      type: 'object',
      properties: {
        id: {
          oneOf: [
            { format: 'numeric' },
            { type: 'array', items: { format: 'numeric' } },
          ]
        },
      }
    })

    const validation = validator({ id: ['1', '2'] })

    assert(validation, JSON.stringify(validator.errors))
  })
})

```

<!--
It would help if you post a working code sample in Tonic notebook and include the link here. You can clone this notebook: https://tonicdev.com/esp/ajv-issue.
-->


**Validation result, data AFTER validation, error messages:**

```
      AssertionError: [{"keyword":"oneOf","dataPath":".id","schemaPath":"#/properties/id/oneOf","params":{},"message":"should match exactly one schema in oneOf"}]


```

**What results did you expect?**
It should validate. `format` and `oneOf` doesn't seem to work properly/the way I thought it would.

**Are you going to resolve the issue?**
If you confirm this is an issue I'll try to help out any way I can.