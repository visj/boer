# [2417] Using if/then/else fails validation

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.12.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->
```javascript
{
    coerceTypes: "array",
    useDefaults: true,
    removeAdditional: "all",
    allErrors: false,
    $data: true,
    strictTypes: true,
    verbose: true
}

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript

{
        type: "object",
        properties: {
            minValue: {
                type: "integer",
                minimum: -1,
                isLessThan: { $data: "1/maxValue" }
            },
            maxValue: {
                type: "integer",
                minimum: -1
            }
        },
        required: ["minValue", "maxValue"],
        if: {
            properties: {
                maxValue: { const: -1 }
            }
        },
        then: {
            properties: {
                minValue: {
                    type: "integer",
                    minimum: -1
                }
            }
        },
        $id: "some-id",
        $schema: "http://json-schema.org/draft-07/schema"
    }
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
const testData = {
    minValue: 2,
    maxValue: -1
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

validate(testData);
```

**Validation result, data AFTER validation, error messages**

```
    <ref *2> [Function: validate18] {
      errors: [
        {
          instancePath: '',
          schemaPath: '#/required',
          keyword: 'required',
          params: { missingProperty: 'minValue' },
          message: "must have required property 'minValue'",
          schema: [ 'minValue', 'maxValue' ],
          parentSchema: {
            type: 'object',
            properties: {
              minValue: {
                type: 'integer',
                minimum: -1,
                isLessThan: { '$data': '1/maxValue' }
              },
              maxValue: { type: 'integer', minimum: -1 }
            },
            required: [ 'minValue', 'maxValue' ],
            if: { properties: { maxValue: { const: -1 } } },
            then: { properties: { minValue: { type: 'integer', minimum: -1 } } },
            '$id': '0ad1ddfd-84e0-4e24-b793-eae349bb9d6c',
            '$schema': 'http://json-schema.org/draft-07/schema'
          },
          data: {}
        }
      ],
      schema: {
        type: 'object',
        properties: {
          minValue: {
            type: 'integer',
            minimum: -1,
            isLessThan: { '$data': '1/maxValue' }
          },
          maxValue: { type: 'integer', minimum: -1 }
        },
        required: [ 'minValue', 'maxValue' ],
        if: { properties: { maxValue: { const: -1 } } },
        then: { properties: { minValue: { type: 'integer', minimum: -1 } } },
        '$id': '0ad1ddfd-84e0-4e24-b793-eae349bb9d6c',
        '$schema': 'http://json-schema.org/draft-07/schema'
      },
      schemaEnv: <ref *1> SchemaEnv {
        refs: {},
        dynamicAnchors: {},
        schema: {
          type: 'object',
          properties: {
            minValue: {
              type: 'integer',
              minimum: -1,
              isLessThan: { '$data': '1/maxValue' }
            },
            maxValue: { type: 'integer', minimum: -1 }
          },
          required: [ 'minValue', 'maxValue' ],
          if: { properties: { maxValue: { const: -1 } } },
          then: { properties: { minValue: { type: 'integer', minimum: -1 } } },
          '$id': '0ad1ddfd-84e0-4e24-b793-eae349bb9d6c',
          '$schema': 'http://json-schema.org/draft-07/schema'
        },
        schemaId: '$id',
        root: [Circular *1],
        baseId: '0ad1ddfd-84e0-4e24-b793-eae349bb9d6c',
        schemaPath: undefined,
        localRefs: {},
        meta: undefined,
        '$async': undefined,
        validateName: ValueScopeName {
          str: 'validate18',
          prefix: 'validate',
          value: { ref: [Circular *2] },
          scopePath: _Code { _items: [ '.', Name { str: 'validate' }, '[', 11, ']' ] }
        },
        validate: [Circular *2]
      }
    }
```

**What results did you expect?**
If maxValue is -1, minValue can be anything greater than -1.  For any other value of maxValue, maxValue has to be greater than minValue.  If I remove the if/then/else from my schema, everything validates correctly.  Not sure if I am doing something silly with my schema or if this is a bug.

**Are you going to resolve the issue?**
Unfortunately, not sure that I can.