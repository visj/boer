# [578] Custom keyword priority: Can be changed? How it works?

I noticed there's no information about keyword execution order.

I'm playing with custom keyword, in particular i needed an option to trim the strings.
I noticed other keywords like `minLength` take place before the data has been trimmed creating a not desired result.

There's a way to change the keyword priority, or being aware of its order?

```javascript
const Ajv = require('ajv')
let ajv = new Ajv()

ajv.addKeyword('trim', {  
  type: 'string',
  modifying: true,
  metaSchema: {type: 'boolean'},
  compile: function (schema) {
    return (schema === true) ? trimValue : () => true

    function trimValue (data, path, obj, key) {
      obj[key] = data.trim()
      return true
    }
  }
})

let schema = {
  type: 'object',
  properties: {
    name: {type: 'string', trim: true, minLength: 3}
  }
}

let validate = ajv.compile(schema)
let data = {name: '   hi   '}
validate(data) // true
data.name // 'hi'
```