# [1244] Should skip extendError if "error" option is "full"

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports. For other issues please use:
- security vulnerability: https://tidelift.com/security)
- a new feature/improvement: https://ajv.js.org/contribute.html#changes
- browser/compatibility issues: https://ajv.js.org/contribute.html#compatibility
- JSON-Schema standard: https://ajv.js.org/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.12.3


**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv#options -->

```javascript
    meta: require("ajv/lib/refs/json-schema-draft-04.json"),
    $data: true,
    schemaId: "auto",
    extendRefs: "ignore",
    missingRefs: true,
    nullable: true,
    allErrors: true,
    messages: true,
    verbose: true,
    inlineRefs: false,
    passContext: true,
    loopRequired: 2,
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "properties": {
    "a": {
      "properties": {
        "kind": { "type": "string" } 
      },
      "select": "0/kind",
      "selectCases": {
        "k0": { "properties": { "k": { "type": "integer" } } } 
      } 
    }
  }
}

```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
  "a": {
    "kind": "k0",
    "k": "123"
  }
}

```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript


```


**Validation result, data AFTER validation, error messages**

```
[
  {
    "keyword": "type",
    "dataPath": "",
    "schemaPath": "#/properties/a/select",
    "params": {
      "type": "string"
    },
    "message": "should be string",
    "schema": "0/kind",
    "parentSchema": {
      "type": "string"
    },
    "data": {
      "kind": "k0",
      "k": 123
    }
  }
]

```

**What results did you expect?**
dataPath should be ".a" and data should be 123

**Are you going to resolve the issue?**
Yes