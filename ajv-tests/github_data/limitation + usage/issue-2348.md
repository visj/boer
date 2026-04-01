# [2348] Type coercion does not work with anyOf Number or Boolean

TL;DR: I want a property to support either a boolean OR a number value. With coercion enabled, `true` will be coerced to `1` or `1` will be coerced to `true` depending on the order of the types in the `anyOf`.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

`0.8.12`

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const ajv = new Ajv({ coerceTypes: true })
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```js
const schema = {
  type: 'object',
  properties: {
    foo: { anyOf: [{ type: 'boolean' }, { type: 'number' }] },  // Define boolean first
    bar: { anyOf: [{ type: 'number' }, { type: 'boolean' }] },  // Define number first
  },
  required: ['foo'],
  additionalProperties: false,
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```js
const boolData = { foo: true, bar: true } // Results in { foo: true, bar: 1 } 
const numData = { foo: 1, bar: 1 } // results in { foo: true, bar: 1 }
```

**What results did you expect?**

```js
const boolData = { foo: true, bar: true } // I expect { foo: true, bar: true } 
const numData = { foo: 1, bar: 1 } // I expect { foo: 1, bar: 1 }
```

Since coercion is done according to the order of the types in the schema, the resulting coerced type depends on whether boolean or number comes first, BUT I believe both results are incorrect. 

The suggestion from this issue: https://github.com/ajv-validator/ajv/issues/399 would have allowed us to fine tune coercion for this use case, but unfortunately I don't believe the suggestion to use keywords helps us in this case. I tried something similar to what was suggested in the comment in that issue but AJV still coerces the value after the keyword.

There must be something I'm missing here. This seems like a fairly common use case that seems broken. Please advise.
