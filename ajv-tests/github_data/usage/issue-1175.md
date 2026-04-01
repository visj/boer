# [1175] Model always return true.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
v6.12.0 (latest atm)
Node v.12


*** Test code
```javascript

const Ajv = require('ajv')

let stringSchema = {
  '$schema': 'http://json-schema.org/draft-07/schema#',
  definitions: {
    Test: {
      type: 'object',
      properties: {
        foo: { type: 'number' },
        bar: { type: 'string', minLength: 8 }
      },
      required: [ 'foo', 'bar' ]
    }
  },
  type: 'object',
  '$id': 'https://foo/bar',
  title: 'Test',
  description: 'Test'
}


const ajv = new Ajv({ allErrors: true })
const validate = ajv.compile(stringSchema)
let user =  {}
let valid = validate(user)

console.log(valid)
console.error(validate.errors)


```
**What results did you expect?**
I exepct this to return false with a validate.errors message.

**Are you going to resolve the issue?**
No - i have no idea howto.
