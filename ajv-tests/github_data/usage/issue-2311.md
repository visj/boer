# [2311] Combination of anyOf and default results in "default is ignored for: data.status" at compile

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Reproducible 8.8.2 and 8.12.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
new Ajv({
  useDefaults: true,
  allErrors: true,
})
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "anyOf": [
    {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "foo"
          ]
        }
      },
      "required": [
        "type"
      ]
    },
    {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "bar"
          ]
        },
        "status": {
          "type": "integer",
          "default": 503
        }
      },
      "required": [
        "type"
      ]
    }
  ]
}
```

**Sample data**

(N/A: fails compilation) 

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
import Ajv from 'ajv'

const schema = {
  anyOf: [
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['foo'],
        },
      },
      required: ['type'],
    },
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['bar'],
        },
        status: {
          type: 'integer',
          default: 503,
        },
      },
      required: ['type'],
    },
  ],
}
console.log(JSON.stringify(schema, null, 2))

new Ajv({
  useDefaults: true,
  allErrors: true,
}).compile(schema)

```

**Validation result, data AFTER validation, error messages**
Fails to compile, with:
```
Error: strict mode: default is ignored for: data.status
    at checkStrictMode (dev/node_modules/ajv/lib/compile/util.ts:211:28)
    at assignDefault (dev/node_modules/ajv/lib/compile/validate/defaults.ts:21:20)
    at assignDefaults (dev/node_modules/ajv/lib/compile/validate/defaults.ts:9:7)
    at iterateKeywords (dev/node_modules/ajv/lib/compile/validate/index.ts:261:34)
    at groupKeywords (dev/node_modules/ajv/lib/compile/validate/index.ts:241:7)
    at dev/node_modules/ajv/lib/compile/validate/index.ts:233:38
    at CodeGen.code (dev/node_modules/ajv/lib/compile/codegen/index.ts:525:33)
    at CodeGen.block (dev/node_modules/ajv/lib/compile/codegen/index.ts:680:20)
    at schemaKeywords (dev/node_modules/ajv/lib/compile/validate/index.ts:232:7)
    at typeAndKeywords (dev/node_modules/ajv/lib/compile/validate/index.ts:161:3)
```

**What results did you expect?**

Schema compiles, this is a valid JSON schema.

**Are you going to resolve the issue?**

I don't know...