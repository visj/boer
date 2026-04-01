# [2044] ajv.compileSerializer(jsonschema)

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
8.11.0

**What problem do you want to solve?**
- Currently, only `ajv.compileSerializer(jtd)`
https://ajv.js.org/guide/getting-started.html#parsing-and-serializing-json
- There is `typescript-json-schema` which can generate json-schema from typescript
- Seems there is no tool can generate json-type-definition from typescript
https://www.npmjs.com/search?q=generate%20json%20type%20definition
https://www.npmjs.com/search?q=generate%20jtd

**What do you think is the correct solution to problem?**
```
ajv.compileSerializer(jsonschema)
```

**Will you be able to implement it?**
