# [2319] Missing Ref when using getSchema and definition has special character

Version: 8.12.0

**Ajv options object**

Code
```javascript
const Ajv = require('ajv')

const schemas = {
  '#/definitions/Zoo': {
    'properties': {
      'animal': {'$ref': '#/definitions/Animal<Dog>'},
    },
  },
  '#/definitions/Animal<Dog>': {
    'properties': {
      'id': {'type': 'number'},
    },
  },
}

const ajv = new Ajv({schemas})
ajv.getSchema('#/definitions/Zoo')
```

This code will throw `MissingRefError: can't resolve reference #/definitions/Animal<Dog> from id #/definitions/Zoo`

**What results did you expect?**
It should get the schema with no error. I we remove the &lt;Dog&gt; from the definition, it works properly. So we could ask: Is it possible to use special chars in a JSON schema definition? It is and I can prove. This code works if I use the `compile` method instead of using the `getSchema` method:

```javascript
const ajv = new Ajv()
const schema = {
  '$ref': '#/definitions/Zoo',
  '$schema': 'http://json-schema.org/draft-07/schema#',
  'definitions': {
    'Zoo': {
      'properties': {
        'animal': {'$ref': '#/definitions/Animal<Dog>'},
      },
    },
    'Animal<Dog>': {
      'properties': {
        'id': {'type': 'number'},
      },
    },
  },
}

const validate = ajv.compile(schema)
const valid = validate({animal: {id: 1}})
```