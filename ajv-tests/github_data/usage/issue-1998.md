# [1998] Cannot get schema whose $id starts with #

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.11.0

**Ajv options object**

I'm using the default options.

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "object",
  "definitions": {
    "def1": {
      "$id": "#number-property",
      "type": "number"
    },
    "def2": {
      "$id": "number-property",
      "type": "number"
    }
  },
  "properties": {
    "property1": {
      "$ref": "number-property"
    }
  }
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
'use strict';

const assert = require('assert')
const Ajv = require('ajv')

const schema = {
  type: 'object',
  definitions: {
    def1: { $id: 'number-property', type: 'number' },
    def2: { $id: '#number-property', type: 'number' }
  },
  properties: {
    property1: { $ref: 'number-property' },
    property2: { $ref: '#number-property' }
  }
}

const ajv = new Ajv()

ajv.addSchema(schema)

assert.ok(ajv.getSchema('number-property'))
assert.ok(ajv.getSchema('#number-property')) // fails, returns undefined
```

**What results did you expect?**

To get the schema by `#number-property` reference
