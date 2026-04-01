# [2554] SchemaEnv cached twice when using `addSchema`

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
`8.17.1`

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const ajv = new Ajv()
```

**JSON Schema**

```json
{
    "$id": "http://example.com/example.json",
    "type": "object",
    "definitions": {},
    "$schema": "http://json-schema.org/draft-07/schema#",
    "properties": {
        "exampleProperty": {
            "$id": "/properties/exampleProperty",
            "type": "string",
            "title": "An example property",
            "default": "This is an example property",
        },
    },
}
```

**Your code**

```javascript
ajv.addSchema(someSchema, 'exampleSchema')
```

**Caching**

Output from logging `ajv` internal cache keys (stored in `ajv._cache`):
```
{"$schema":"http://json-schema.org/draft-07/schema#","$id":"http://json-schema.org/draft-07/schema#","title":"Core schema meta-schema","definitions":{"schemaArray":{"type":"array","minItems":1,"items":{"$ref":"#"}},"nonNegativeInteger": {"type":"integer","minimum":0},"nonNegativeIntegerDefault0":{"allOf":[{"$ref":"#/definitions/nonNegativeInteger"},{"default":0}]},"simpleTypes":{"enum":["array","boolean","integer","null","number","object","string"]},"stringArray":{"type":"array","items":{"type":"string"},"uniqueItems":true,"default":[]}},"type":["object","boolean"],"properties":{"$id":{"type":"string","format":"uri-reference"},"$schema":{"type":"string","format":"uri"},"$ref":{"type":"string","format":"uri-reference"},"$comment":{"type":"string"},"title":{"type":"string"},"description":{"type":"string"},"default":true,"readOnly":{"type":"boolean","default":false},"examples":{"type":"array","items":true},"multipleOf":{"type":"number","exclusiveMinimum":0},"maximum":{"type":"number"},"exclusiveMaximum":{"type":"number"},"minimum":{"type":"number"},"exclusiveMinimum":{"type":"number"},"maxLength":{"$ref":"#/definitions/nonNegativeInteger"},"minLength":{"$ref":"#/definitions/nonNegativeIntegerDefault0"},"pattern":{"type":"string","format":"regex"},"additionalItems":{"$ref":"#"},"items":{"anyOf":[{"$ref":"#"},{"$ref":"#/definitions/schemaArray"}],"default":true},"maxItems":{"$ref":"#/definitions/nonNegativeInteger"},"minItems":{"$ref":"#/definitions/nonNegativeIntegerDefault0"},"uniqueItems":{"type":"boolean","default":false},"contains":{"$ref":"#"},"maxProperties":{"$ref":"#/definitions/nonNegativeInteger"},"minProperties":{"$ref":"#/definitions/nonNegativeIntegerDefault0"},"required":{"$ref":"#/definitions/stringArray"},"additionalProperties":{"$ref":"#"},"definitions":{"type":"object","additionalProperties":{"$ref":"#"},"default":{}},"properties":{"type":"object","additionalProperties":{"$ref":"#"},"default":{}},"patternProperties":{"type":"object","additionalProperties":{"$ref":"#"},"propertyNames":{"format":"regex"},"default":{}},"dependencies":{"type":"object","additionalProperties":{"anyOf":[{"$ref":"#"},{"$ref":"#/definitions/stringArray"}]}},"propertyNames":{"$ref":"#"},"const":true,"enum":{"type":"array","items":true,"minItems":1,"uniqueItems":true},"type":{"anyOf":[{"$ref":"#/definitions/simpleTypes"},{"type":"array","items":{"$ref":"#/definitions/simpleTypes"},"minItems":1,"uniqueItems":true}]},"format":{"type":"string"},"contentMediaType":{"type":"string"},"contentEncoding":{"type":"string"},"if":{"$ref":"#"},"then":{"$ref":"#"},"else":{"$ref":"#"},"allOf":{"$ref":"#/definitions/schemaArray"},"anyOf":{"$ref":"#/definitions/schemaArray"},"oneOf":{"$ref":"#/definitions/schemaArray"},"not":{"$ref":"#"}},"default":true}
{"$id":"http://example.com/example.json","type":"object","properties":{"exampleProperty":{"$id":"/properties/exampleProperty","type":"string","title":"An example property","default":"This is an example property"}}}
```

Output from `console.log(ajv.schemas)`:
```
{
  'http://json-schema.org/draft-07/schema': <ref *1> SchemaEnv {
    refs: {
      'http://json-schema.org/draft-07/schema#/definitions/nonNegativeInteger': [Object],
      'http://json-schema.org/draft-07/schema#/definitions/nonNegativeIntegerDefault0': [SchemaEnv],
      'http://json-schema.org/draft-07/schema#/definitions/schemaArray': [SchemaEnv],
      'http://json-schema.org/draft-07/schema#/definitions/stringArray': [Object],
      'http://json-schema.org/draft-07/schema#/definitions/simpleTypes': [Object]
    },
    dynamicAnchors: {},
    schema: {
      '$schema': 'http://json-schema.org/draft-07/schema#',
      '$id': 'http://json-schema.org/draft-07/schema#',
      title: 'Core schema meta-schema',
      definitions: [Object],
      type: [Array],
      properties: [Object],
      default: true
    },
    schemaId: '$id',
    root: [Circular *1],
    baseId: 'http://json-schema.org/draft-07/schema',
    schemaPath: undefined,
    localRefs: {},
    meta: true,
    '$async': undefined,
    validateName: ValueScopeName {
      str: 'validate0',
      prefix: 'validate',
      value: [Object],
      scopePath: [_Code]
    },
    validate: [Function: validate0] {
      errors: null,
      schema: [Object],
      schemaEnv: [Circular *1]
    }
  },
  exampleSchema: <ref *2> SchemaEnv {
    refs: {},
    dynamicAnchors: {},
    schema: {
      '$id': 'http://example.com/example.json',
      type: 'object',
      properties: [Object]
    },
    schemaId: '$id',
    root: [Circular *2],
    baseId: 'http://example.com/example.json',
    schemaPath: undefined,
    localRefs: {},
    meta: undefined,
    '$async': undefined
  }
}

```

**What results did you expect?**
I would expect the `SchemaEnv` object to only be cached in one place, when adding a schema through `addSchema` function the schema is cached twice:
- Within `this._cache` in `_addSchema` call [here](https://github.com/ajv-validator/ajv/blob/9050ba1359fb87cd7c143f3c79513ea7624ea443/lib/core.ts#L719).
- Within `this.schemas` in `addSchema` call [here](https://github.com/ajv-validator/ajv/blob/9050ba1359fb87cd7c143f3c79513ea7624ea443/lib/core.ts#L490).

For extremely large schemas the entry in `this._cache` is particularly memory intensive since it stores the `SchemaEnv` object using the entire schema as a key. It would be preferable to be able to use `addSchema` to cache the `SchemaEnv` object **only once** using the key provided in the `addSchema` call to optimise the memory used by caching.

**Are you going to resolve the issue?**
Yes
