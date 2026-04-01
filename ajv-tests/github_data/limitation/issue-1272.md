# [1272] inlineRefs: true with useDefaults: true and default inside $ref assigns default inside composite keyword (instead of ignoring it)

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

I'm using 6.12.4

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

See [runkit ajv-issue](https://runkit.com/akalsi87/5f53b89aa5c9e4001a20547d).

**Validation result, data AFTER validation, error messages**

```
TypeError: Validation error for type 'Config': [
  {
    "keyword": "required",
    "dataPath": ".publicAddress.ip",
    "schemaPath": "IpEndpoint#/definitions/IpEndpoint/required",
    "params": {
      "missingProperty": "host"
    },
    "message": "should have required property 'host'"
  },
  {
    "keyword": "required",
    "dataPath": ".publicAddress",
    "schemaPath": "#/oneOf/1/required",
    "params": {
      "missingProperty": "unix"
    },
    "message": "should have required property 'unix'"
  },
  {
    "keyword": "oneOf",
    "dataPath": ".publicAddress",
    "schemaPath": "#/oneOf",
    "params": {
      "passingSchemas": null
    },
    "message": "should match exactly one schema in oneOf"
  }
]
```

**What results did you expect?**

Equivalent output with inlineRefs = true and inlineRefs = false.

**Are you going to resolve the issue?**

Can do with help. Relatively new to JavaScript and AJV and JSON Schemas. 😄 