# [1934] oneOf validate failed

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.10.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{}
```

**JSON Schema**



```json
{
  "title": "Block object",
  "type": "object",
  "required": [
    "transactions"
  ],
  "properties": {
    "transactions": {
      "oneOf": [
        {
          "title": "Full transactions",
          "type": "array",
          "items": {
            "title": "Signed 1559 Transaction",
            "type": "object",
            "required": [
              "chainId",
              "input"
            ],
            "properties": {
              "input": {
                "title": "input data",
                "type": "string",
                "pattern": "^0x[0-9a-f]*$"
              },
              "chainId": {
                "title": "chainId",
                "type": "string",
                "pattern": "^0x([1-9a-f]+[0-9a-f]*|0)$",
                "description": "Chain ID that this transaction is valid on."
              }
            }
          }
        },
        {
          "title": "Transaction hashes",
          "type": "array",
          "items": {
            "title": "32 byte hex value",
            "type": "string",
            "pattern": "^0x[0-9a-f]{64}$"
          }
        }
      ]
    }
  }
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "transactions": []
}
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
const ajv = new Ajv();
const blockSchemaValidator = ajv.compile(schema);
const valid = blockSchemaValidator(block.result);
```

**Validation result, data AFTER validation, error messages**

```
// valid: false
[
  {
    instancePath: '/transactions',
    schemaPath: '#/properties/transactions/oneOf',
    keyword: 'oneOf',
    params: { passingSchemas: [Array] },
    message: 'must match exactly one schema in oneOf'
  }
]
```

**What results did you expect?**
The result should pass , because the transactions field is an empty array

**Are you going to resolve the issue?**
Not Sure