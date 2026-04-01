# [552] `removeAdditional` should only remove properties if the schema is valid

For the following schema, validation fails when `removeAdditional` is used. The issue is that the property `b` is removed when testing the first schema, and then the validation of the second schema fails because `b` no longer exists on the object. I propose that `removeAdditional` would only mutate the data if it passes validation. Thoughts?

```javascript
const Ajv = require('ajv')
const ajv = new Ajv({ allErrors: true, removeAdditional: true  })
const validate = ajv.compile({
  oneOf: [{
    properties: {
      a: { type: 'string' }
    },
    additionalProperties: false
  },{
    properties: {
      b: { type: 'string' }
    },
    additionalProperties: false
  }]
})
const data = { b: 'foo' }
console.log(validate(data)) // false
console.log(validate.errors[0].message) //  'should match exactly one schema in oneOf'
console.log(data) // {}
```