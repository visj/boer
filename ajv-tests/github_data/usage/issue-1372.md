# [1372] if/then validation not applied when value requires coercion.

Sorry, for another one so quickly.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
v7.0.2

**Ajv options object**
```javascript
{
  strict: false,
  coerceTypes: true,
  allErrors: true
}
```

**JSON Schema**
```json
{
  type: 'object',
  properties: {
    value: {
      type:'number'
    }
  },
  allOf:[{
    "if": {
      "required": ["value"]
    },
    "then": {
      "properties": {
        "value": {
          "minimum": 0,
          "maximum": 14
        }
      },
      "required": ["value"]
    }
  }]
}
```

**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
  'value': '-1'
}
```

**Your code**

```javascript
const Ajv = require('ajv').default

const ajv = new Ajv({
  strict: false,
  coerceTypes: true,
  allErrors: true
})
let validateTest = ajv.compile({
  type: 'object',
  properties: {
    value: {
      type:'number',
      minimum:0
    }
  }
})
// Test 1
validateTest({
  'value': '-101'
})
console.log('expected', validateTest.errors) // Error on minimum

validateTest = ajv.compile({
  type: 'object',
  properties: {
    value: {
      type:'number'
    }
  },
  allOf:[{
    "if": {
      "required": ["value"]
    },
    "then": {
      "properties": {
        "value": {
          "minimum": 0,
          "maximum": 14
        }
      },
      "required": ["value"]
    }
  }]
})

// Test 2
validateTest({
  'value': -1
})
console.log('expected', validateTest.errors) // Error on minimum & if

// Test 3
validateTest({
  'value': '-1'
})
console.log('unexpected', validateTest.errors)  // null, expect same as test 2
```

**What results did you expect?**
From the above code I expect test 3 to have the same validation errors as test 2. This also applies when using `anyOf` and `oneOf`. Test 1 does coerce and validate properly when not using conditional logic. This does run as expected with ajv v6.



