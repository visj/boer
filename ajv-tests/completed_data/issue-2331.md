# [2331] Confusing `Error: strict mode: unknown keyword: "0"` error when not seemingly using any unknown keywords

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

This happens when I'm using the latest current verison of Ajv (currently `v8.12.0`)

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{
  "strict": true
}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "ABC": {
      "type": "array",
      "items": [
        {
          "type": "string"
        }
      ]
    }
  },
  "type": "array",
  "items": [
    {
      "type": "boolean"
    }
  ],
  "additionalItems": {
    "$ref": "#/definitions/ABC/items"
  }
}
```

**Sample data**

No data required because this is a bug in strict mode validating the schema itself.

```json
{}
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

RunKit: https://runkit.com/hyperupcall/ajv-issue

(the runkit link is very useful, i was confused for an embarrasingly long time because it used a very old node.js and ajv version which had different results - i'm mentioning this in case this feedback is useful) 

```javascript
const Ajv = require("ajv")
const ajv = new Ajv(options)

const validate = ajv.compile(schema)

const valid = validate(data)
if (!valid) console.log(validate.errors)

```

**Validation result, data AFTER validation, error messages**

```
node index.js
/tmp/tmp.tu8EDBQWrp/node_modules/ajv/dist/compile/index.js:120
        throw e;
        ^

Error: strict mode: unknown keyword: "0"
    at checkStrictMode (/tmp/tmp.tu8EDBQWrp/node_modules/ajv/dist/compile/util.js:174:15)
    at checkUnknownRules (/tmp/tmp.tu8EDBQWrp/node_modules/ajv/dist/compile/util.js:32:13)
    at checkKeywords (/tmp/tmp.tu8EDBQWrp/node_modules/ajv/dist/compile/validate/index.js:120:34)
    at subschemaCode (/tmp/tmp.tu8EDBQWrp/node_modules/ajv/dist/compile/validate/index.js:89:9)
    at KeywordCxt.subschema (/tmp/tmp.tu8EDBQWrp/node_modules/ajv/dist/compile/validate/index.js:438:9)
    at inlineRefSchema (/tmp/tmp.tu8EDBQWrp/node_modules/ajv/dist/vocabularies/core/ref.js:38:32)
    at Object.code (/tmp/tmp.tu8EDBQWrp/node_modules/ajv/dist/vocabularies/core/ref.js:24:16)
    at keywordCode (/tmp/tmp.tu8EDBQWrp/node_modules/ajv/dist/compile/validate/index.js:464:13)
    at /tmp/tmp.tu8EDBQWrp/node_modules/ajv/dist/compile/validate/index.js:185:25
    at CodeGen.code (/tmp/tmp.tu8EDBQWrp/node_modules/ajv/dist/compile/codegen/index.js:439:13)

Node.js v20.4.0
```

**What results did you expect?**

It seems that the error is that I'm trying to `$ref` an array, when it is expecting an object (perhaps `items/0`). The confusing error seems to go away when I collapse the `$ref`.

The `unknown keyword: "0"` is confusing because to me because I don't have a property called `0` anywhere - which means I can't grep where in this schema the error is located. Maybe the error can be made less confusing.

**Are you going to resolve the issue?**

Unfortunately, I cannot fix this issue myself.