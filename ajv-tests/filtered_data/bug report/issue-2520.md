# [2520] Bug in conditions `if/then`.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
version: 8.17.1 (latest)

**Ajv options object**

```typescript
const ajv = new Ajv({
  strict: true
})
```

**JSON Schema**

```javascript
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    age: {
      type: 'number'
    }
  },
  required: [ 'name' ],
  if: {
    properties: {
      name: { type: 'string', minLength: 3 }
    }
  },
  then: {
    properties: {
      age: { type: 'number', minimum: 10 }
    },
    required: [ 'age' ]
  }
}
```

**Sample data**
```json
const data = {
  name: undefined,
  age: undefined
}
```

**Validation result, data AFTER validation, error messages**

```
[
  {
    instancePath: '',
    keyword: 'required',
    message: 'must have required property `age`',
    params: {
      missingProperty: 'age'
    },
    schemaPath: '#/then/required'
  }
]
```

**What results did you expect?**

```
[
  {
    instancePath: '',
    keyword: 'required',
    message: 'must have required property `name`',
    params: {
      missingProperty: 'name'
    },
    schemaPath: '#/then/required'
  }
]
```

So, I'm trying validate the data by this `schema`. And faced with unexpected behavior. In this example I've got error with `age` field instead of `name`. So I expect that `name` field at first level in object must be validated before `age`.
By the way, in another example, if I've got an empty string in `name` field, I have a valid `data`.

I've tried to change the schema like this using `allOf`:

```javascript
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    age: {
      type: 'number'
    }
  },
  required: [ 'name' ],
  allOf: [
    {
      if: {
        properties: {
          name: { type: 'string', minLength: 3 }
        }
      },
      then: {
        properties: {
          age: { type: 'number', minimum: 10 }
        },
        required: [ 'age' ]
      }
    }
  ]
}
```

Same result.

**Are you going to resolve the issue?**
I'm asking your comment and advice first of all.
