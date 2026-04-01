# [1255] Incomplete schemaPath information when $ref is used

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?** 6.12.3

**What problem do you want to solve?**

When external references (`$ref`) are used, `schemaPath` misses information on full schema path, through which error originated.

### 1. Example of schema without `$ref`

_Schema_:
```json
{
  "type": "object",
  "properties": {
    "items": {
      "oneOf": [
        { "type": "string" },
        {
          "type": "array",
          "items": { "type": "string" }
        }
      ]
    }
  }
}
```

_Tested object_:
```json
{ "items": [123] }
```

_Produced errors_:
```javascript
[
  {
    keyword: 'type',
    dataPath: '.items',
    schemaPath: '#/properties/items/oneOf/0/type',
    params: { type: 'string' },
    message: 'should be string'
  },
  {
    keyword: 'type',
    dataPath: '.items[0]',
    schemaPath: '#/properties/items/oneOf/1/items/type',
    params: { type: 'string' },
    message: 'should be string'
  },
  {
    keyword: 'oneOf',
    dataPath: '.items',
    schemaPath: '#/properties/items/oneOf',
    params: { passingSchemas: null },
    message: 'should match exactly one schema in oneOf'
  }
]
```

In above listing, we can clearly distinguish error that states, that none of the `oneOf` schemas matched, and errors coming from individual options (schema paths prefixed with ` '#/properties/items/oneOf/{oneOfSchemaIndex}`)

### 1. Example of schema with `$ref`

_Schema_:

```json
{
  "type": "object",
  "properties": {
    "items": {
      "oneOf": [
        { "$ref": "#/definitions/code" },
        {
          "type": "array",
          "items": { "$ref": "#/definitions/code" }
        }
      ]
    }
  },
  "definitions": {
    "code": { "type": "string" }
  }
}
```

_Produced errors_:
```javascript
[
  {
    keyword: 'type',
    dataPath: '.items',
    schemaPath: '#/definitions/code/type',
    params: { type: 'string' },
    message: 'should be string'
  },
  {
    keyword: 'type',
    dataPath: '.items[0]',
    schemaPath: '#/definitions/code/type',
    params: { type: 'string' },
    message: 'should be string'
  },
  {
    keyword: 'oneOf',
    dataPath: '.items',
    schemaPath: '#/properties/items/oneOf',
    params: { passingSchemas: null },
    message: 'should match exactly one schema in oneOf'
  }
]
```

Above errors miss information on full schema path, from which errors originated and in some scenarions that makes quite hard to reason about them (e.g. we can't distinguish which error originates from which oneOf option)

**What do you think is the correct solution to problem?**

A. Possibly expose `schemaPathsChain` param, which would expose full schema path, e.g. for first error it'd equal: `["#/properties/items/oneOf/0/", "#/definitions/code/type"]`
B. (More a workaround) Provide an option to normalize schemas so all `$ref`'s are resolved with schemas being copied in place (still that will not work for eventual circular references)



