# [1577] instancePath: '/0' could be array index or property name

Using AJV v8.1

It's difficult to distinguish between `/0` being an index in an array and `/0` being a property that is missing objects.
While naming properties with numbers isn't best practice, it does introduce confusion when looking at array index errors.

You can use the schemaPath to see if it's `items` or `properties`, but the original `[0]` was clearer. If you use `ajv.errorText` you also cannot distinguish.

I tried to look in the release notes to see if this was purposely changed, but couldn't find anything so figured it wouldn't hurt to open. 🙂 

runkit link: https://runkit.com/embed/sjhhfxjve5fy

```javascript
let ajv = require('ajv')
const v = new ajv({ useDefaults: true, allErrors: true, strict: false, logger: false })

const foo = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string'
      }
    },
    required: ['name']
  }
}
const fooValidator = v.compile(foo)
fooValidator([{}])

const bar = {
  type: 'object',
  properties: {
    0: {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        }
      },
      required: ['name']
    }
  }
}
const barValidator = v.compile(bar)
barValidator({ 0: {} })
```

**Validation result, data AFTER validation, error messages**

```js
> fooValidator.errors
[
  {
    instancePath: '/0',
    schemaPath: '#/items/required',
    keyword: 'required',
    params: { missingProperty: 'name' },
    message: "must have required property 'name'"
  }
]

> barValidator.errors
[
  {
    instancePath: '/0',
    schemaPath: '#/properties/0/required',
    keyword: 'required',
    params: { missingProperty: 'name' },
    message: "must have required property 'name'"
  }
]
```

**What results did you expect?**
`instancePath: '[0]'` for fooValidator

**Are you going to resolve the issue?**
yes, once I know it's real :-)
