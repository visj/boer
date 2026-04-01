# [2447] Handling of URL encoding changed/broke in 8.15

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.15 (latest version)

**Ajv options object**

```javascript
const ajv = new AJV();
```

**JSON Schema**

```json
{
  "$ref": "#/definitions/Record%3Cstring%2CPerson%3E",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "Person": {
      "type": "object",
      "properties": {
        "firstName": {
          "type": "string",
          "description": "The person's first name."
        }
      }
    }
    "Record<string,Person>": {
      "type": "object",
      "additionalProperties": {
        "$ref": "#/definitions/Person"
      }
    }
  }
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "joe": {
    "firstName": "Joe"
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
const AJV = require('ajv');
const ajv = new AJV(options);
const validate = ajv.compile(schema);
console.log(validate(data));
```

**Validation result, data AFTER validation, error messages**

Compiler error:
```
MissingRefError: can't resolve reference #/definitions/Record%3Cstring%2CPerson%3E from id #
    at Object.code (node_modules/ajv/dist/vocabularies/core/ref.js:21:19)
    at keywordCode (node_modules/ajv/dist/compile/validate/index.js:464:13)
    at node_modules/ajv/dist/compile/validate/index.js:185:25
    at CodeGen.code (node_modules/ajv/dist/compile/codegen/index.js:439:13)
    at CodeGen.block (node_modules/ajv/dist/compile/codegen/index.js:568:18)
    at schemaKeywords (node_modules/ajv/dist/compile/validate/index.js:185:13)
    at typeAndKeywords (node_modules/ajv/dist/compile/validate/index.js:128:5)
    at node_modules/ajv/dist/compile/validate/index.js:70:9
    at CodeGen.code (node_modules/ajv/dist/compile/codegen/index.js:439:13)
    at node_modules/ajv/dist/compile/validate/index.js:37:166 {
  missingRef: '#/definitions/Record%3Cstring%252CPerson%3E',
  missingSchema: ''
}
```

**What results did you expect?**

Successful compilation of the schema. This worked in 8.14 and works in https://www.jsonschemavalidator.net/, but 8.15's change of URL library seems to have altered its behavior.

**Are you going to resolve the issue?**

I know that 8.15's URL parser changes are actively being worked on, but I can help if needed.