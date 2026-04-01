# [1964] 2020-12: DynamicRef and DynamicAnchor unusual validation behavior

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.11.0

**Ajv options object**

```javascript
{}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "array",
  "minItems": 1,
  "maxItems": 1,
  "prefixItems": [
    {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "nodes": {
          "type": "array",
          "items": {
            "$dynamicRef": "#/node"
          }
        }
      },
      "required": [
        "id",
        "nodes"
      ],
      "$dynamicAnchor": "node"
    }
  ],
  "items": false
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
[
  {
    "id": "A",
    "nodes": [
      {
        "id": "B",
        "nodes": []
      },
      {
        "id": "C",
        "nodes": []
      }
    ]
  }
]
```

**Your code**

```javascript
import Ajv from 'ajv/dist/2020'

const schema = {
    "type": "array",
    "minItems": 1,
    "maxItems": 1,
    "prefixItems": [
        {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                },
                "nodes": {
                    "type": "array",
                    "items": {
                        "$dynamicRef": "#/node"
                    }
                }
            },
            "required": [
                "id",
                "nodes"
            ],
            "$dynamicAnchor": "node"
        }
    ],
    "items": false
}

const ajv = new Ajv()

// ---------------------------------------------------
// This validation passes
// ---------------------------------------------------
const resultA = ajv.validate(schema, [
    {
        "id": "A",
        "nodes": []
    }
])

console.log(resultA, ajv.errors)

// outputs: true null

// ---------------------------------------------------
// This validation fails
// ---------------------------------------------------
const resultB = ajv.validate(schema, [
    {
        "id": "A",
        "nodes": [{
            "id": "B",
            "nodes": []
        },
        {
            "id": "C",
            "nodes": []
        }]
    }
])

console.log(resultB, ajv.errors)

// outputs: false [
//   {
//     instancePath: '/0/nodes/0',
//     schemaPath: '#/type',
//     keyword: 'type',
//     params: { type: 'array' },
//     message: 'must be array'
//   }
// ]
```

**Validation result, data AFTER validation, error messages**

```
0/nodes/0 must be array
```

**What results did you expect?**

Adding values to an array should not cause AJV to report `0/nodes/0 must be array`

**Are you going to resolve the issue?**

Resolution of this issue is non actionable by me