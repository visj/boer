# [2041] Many errors when using oneOf for switch/case validation

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.10
**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'carsSchema',
  type: 'object',
  oneOf: [
    { $ref: '#/$defs/trainRequiredFields' },
    { $ref: '#/$defs/busRequiredFields' },
    { $ref: '#/$defs/carRequiredFields' }
  ],
  additionalItems: false,
  required: ['vehicleType'],
  $defs: {
    trainRequiredFields: {
      type: 'object',
      properties: {
        vehicleType: { const: 'train' },
        name: {
          type: 'string'
        },
        trainType: {
          type: 'string'
        }
      },
      required: ['name', 'trainType']
    },
    busRequiredFields: {
      type: 'object',
      properties: {
        vehicleType: { const: 'bus' },
        name: {
          type: 'string',
        },
        isSchool: {
          type: 'boolean'
        }
      },
      required: ['name', 'isSchool']
    },
    carRequiredFields: {
      type: 'object',
      properties: {
        vehicleType: { const: 'car' },
        name: {
          type: 'string'
        },
        engineType: {
          type: 'string'
        },
        hp: {
          type: 'number'
        }
      },
      required: ['name', 'engineType']
    }
  }
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json

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

```

**Validation result, data AFTER validation, error messages**
Message:
Value "car" does not match const.
Schema path:
carsSchema#/$defs/busRequiredFields/properties/vehicleType/const
Message:
Value "car" does not match const.
Schema path:
carsSchema#/$defs/trainRequiredFields/properties/vehicleType/const
Message:
Invalid type. Expected Number but got String.
Schema path:
carsSchema#/$defs/carRequiredFields/properties/hp/type
Message:
Required properties are missing from object: isSchool.
Schema path:
carsSchema#/$defs/busRequiredFields/required
Message:
Required properties are missing from object: trainType.
Schema path:
carsSchema#/$defs/trainRequiredFields/required
```

```

**What results did you expect?**
Does it correct behaviour to add additional fields per "vehicleType" eg. only the "car" type has the "hp" property. I'm getting many errors from other types too. How to create create a schema that will validate only one particular type? eg. only train if the vehicleType is "train"
**Are you going to resolve the issue?**
