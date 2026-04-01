# [1872] Using strict mode in both draft-2019-09 and draft-07

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

`^8.8.2`

**Your code**

```javascript
const Ajv = require('ajv/dist/2019')
const draft7MetaSchema = require('ajv/dist/refs/json-schema-draft-07.json')

const ajvInstance = new Ajv()

ajvInstance.addMetaSchema(draft7MetaSchema)

const validate = ajvInstance.compile({
  $schema: 'http://json-schema.org/draft-07/schema',
  type: 'array',
  contains: {
    type: 'number',
  },
  minContains: 2
})

const result = validate([1])

console.log(result, validate.errors)
```

**Validation result, data AFTER validation, error messages**

```
[
  {
    instancePath: '',
    schemaPath: '#/contains',
    keyword: 'contains',
    params: { minContains: 2 },
    message: 'must contain at least 2 valid item(s)'
  }
]
```

**What results did you expect?**

`Error: strict mode: unknown keyword: "minContains"`

Is it bug or feature? I want to use both drafts in my project as it described here https://ajv.js.org/guide/schema-language.html#draft-2019-09-and-draft-2020-12, but it seems like there is no difference between draft 2019-09 and draft-07 in this case.
