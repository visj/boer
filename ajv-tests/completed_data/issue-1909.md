# [1909] Usage of `unevaluatedItems` always results in "must NOT have more than true items"

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.10.0 (latest)

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
import Ajv from 'ajv/dist/2019';
const ajv = new Ajv({ allErrors: true });
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "array",
  "unevaluatedItems": false,
  "allOf": [
    {
      "contains": {
        "type": "object",
        "properties": {
          "attribute1": {
            "const": "A",
          },
        },
      },
    },
  ],
  "anyOf": [
    {
      "contains": {
        "type": "object",
        "properties": {
          "attribute1": {
            "const": "B",
          },
        },
      },
    },
    {
      "contains": {
        "type": "object",
        "properties": {
          "attribute1": {
            "const": "C",
          },
        },
      },
    },
  ],
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
[
  { 
    "attribute1": "A" 
  },
  { 
    "attribute1": "B" 
  }, 
  { 
    "attribute1": "C" 
  }
]
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
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);
validate(json);
```

**Validation result, data AFTER validation, error messages**

```
[
  {
    "instancePath": "",
    "keyword": "unevaluatedItems",
    "message": "must NOT have more than true items",
    "params": { "limit": true },
    "schemaPath": "#/unevaluatedItems"
  }
]
```

**What results did you expect?**

Expected this schema to be valid, I was going to go from here to testing the validations when one of the items is not evaluated but as it turns out adding `"unevaluatedItems": false,` generates a hard failure at these lines: https://github.com/ajv-validator/ajv/blob/master/lib/vocabularies/unevaluated/unevaluatedItems.ts#L28-L30

I used https://json-schema.hyperjump.io/ to confirm that this example should work, i.e. is valid in the case I have documented in this ticket and is invalid if we change CONST2 or CONST3 to something else, in other words triggering the unevaluated items clause.

**Are you going to resolve the issue?**

I can try to resolve the issue, would love some guidance first. Maybe I'm confused or misusing the feature or something else.