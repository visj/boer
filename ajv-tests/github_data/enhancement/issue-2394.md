# [2394] oneOf returns unwanted errors

**What version of Ajv you are you using?**
8.12.0

**What problem do you want to solve?**

Schema:
`
var schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
  children: {
    type: 'array',
    items: {
        oneOf: [{
          type: 'object',
          properties: {
            a: {
              type: 'string'
            }
          },
          required: ['a'],
          additionalProperties: false
        }, {
          type: 'object',
          properties: {
            b: {
              type: 'string'
            }
          },
          required: ['b'],
          additionalProperties: false
        }]
    }
  }
}
};
`

Data:
` const data = {
"children": [
    {
        a: 'a'
      },
     {
        b: 'b'
      },
     {
        c: 'c'
      }
]
};
`

Code:
`
var Ajv = require('ajv');
var ajv = new Ajv();
ajv.validate(schema, data);
console.log('Errors:', ajv.errors);
`

Errors:
Array of 3 items:
`
0: Object
instancePath: "/children/2"
schemaPath: "#/properties/children/items/oneOf/0/required"
keyword: "required"
params: Object {missingProperty: "a"}
message: "must have required property 'a'"
`

`1: Object
instancePath: "/children/2"
schemaPath: "#/properties/children/items/oneOf/1/required"
keyword: "required"
params: Object {missingProperty: "b"}
message: "must have required property 'b'"`

`
2: Object
instancePath: "/children/2"
schemaPath: "#/properties/children/items/oneOf"
keyword: "oneOf"
params: Object {passingSchemas: null}
message: "must match exactly one schema in oneOf"
`

In real use case I have 20+ properties. And if in the data there's a typo, I get 20+ errors, when I'm looking for only "must match exactly one schema in oneOf". Is there a way to update the schema such that I get only the oneOf error?