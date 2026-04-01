# [1573] handling of $dynamicRef on openApi v3.1 spec schema

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.2.0
**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{ strict:false }
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
 {
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "in": {
      "enum": [
        "query",
        "header",
        "path",
        "cookie"
      ]
    },
    "required": {
      "default": false,
      "type": "boolean"
    },
    "schema": {
      "$dynamicRef": "#meta"
    },
    "content": {
      "type": "object"
    }
  },
  "required": [
    "in"
  ],
  "oneOf": [
    {
      "required": [
        "schema"
      ]
    },
    {
      "required": [
        "content"
      ]
    }
  ],
  "$defs": {
    "schema": {
      "$dynamicAnchor": "meta",
      "type": [
        "object",
        "boolean"
      ]
    }
  }
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "name": "limit",
  "in": "query",
  "description": "How many items to return at one time (max 100)",
  "required": false,
  "schema": {
    "type": "integer",
    "format": "int32"
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
const Ajv = require("ajv/dist/2020.js")

const ajv = new Ajv(options)

const validate = ajv.compile(schema);

console.log(validate(data));
console.log(validate.errors);
```
https://runkit.com/seriousme/ajv-dynamicref

**Validation result, data AFTER validation, error messages**

```
false
[
  {
    instancePath: '/schema',
    schemaPath: '#/oneOf/0/required',
    keyword: 'required',
    params: { missingProperty: 'schema' },
    message: "must have required property 'schema'"
  },
  {
    instancePath: '/schema',
    schemaPath: '#/oneOf/1/required',
    keyword: 'required',
    params: { missingProperty: 'content' },
    message: "must have required property 'content'"
  },
  {
    instancePath: '/schema',
    schemaPath: '#/oneOf',
    keyword: 'oneOf',
    params: { passingSchemas: null },
    message: 'must match exactly one schema in oneOf'
  }
]
```

**What results did you expect?**
I expected the validation to succeed.
https://json-schema.hyperjump.io/  says the data matches the schema.

The schema is part of the [OpenApi 3.1 schema](https://github.com/OAI/OpenAPI-Specification/blob/main/schemas/v3.1/schema.json) (which is not under my control)
The data is part of the well known Petstore example 
( I created a [v3.1 Petstore example](https://gist.github.com/seriousme/55bd4c8ba2e598e416bb5543dcd362dc#file-petstore-v3-1-json) by taking the v3.0 Petstore example, updating the `openapi` version to "3.1.0" and adding a licence URL)

Validation of the full v3.1 Petstore example against the full 3.1 schema works with:
- [Hyperjump](https://json-schema.hyperjump.io/) 
- [jschon for Python](https://github.com/marksparkza/jschon)

Which leads me to think that the issue is not in the schema but in Ajv ;-)

I also tried to resolve the issue by tweaking the schema:
- Replacing `"$dynamicRef": "#meta"`  by `"type": [ "object", "boolean"]` solves the issue.
- Replacing `"$dynamicRef": "#meta"` by `"$ref": "#/$defs/schema"` solves the issue as well.
(when applied to the full OpenApi 3.1 schema this lets Ajv validate the full Petstore example as well)
- Removing `/$defs/schema` from the schema still gives the same error.

Hence my suspicion that the problem is caused by the handling of `$dynamicRef` by Ajv

**Are you going to resolve the issue?**
I'm happy to help but I think it requires some quite deep knowledge of Ajv internals.