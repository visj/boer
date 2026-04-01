# [671] errorDataPath: 'property' with additionalProperties: false results in faulty dataPath values with square brackets

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

The error happens on the latest versions: 6.0.0 & 6.0.1. 

**Ajv options object**

```js
{
  errorDataPath: 'property'
}
```

**JSON Schema**
```js
{
  type: 'object',
  required: ['a'],
  additionalProperties: false,
  properties: {
    a: { type: 'string' }
  }
}
```

**Sample data**

```js
{
  a: 'test',
  additional: 1
}
```
**Your code**

```javascript
const Ajv = require('ajv')

const schema = {
  type: 'object',
  required: ['a'],
  additionalProperties: false,
  properties: {
    a: { type: 'string' }
  }
}

const ajv = new Ajv({ errorDataPath: 'property' });

const data = {
  a: 'test',
  additional: 1
}

const validate = ajv.compile(schema)
const valid = validate(data)
if (!valid) {
  console.log(validate.errors[0])
}
```

**Validation result, data AFTER validation, error messages**

```js
{
  dataPath: '[\'additional\']',
  keyword: 'additionalProperties',
  message: 'should NOT have additional properties',
  params: { additionalProperty: 'additional' },
  schemaPath: '#/additionalProperties'
}
```

**What results did you expect?**

The dataPath should be `'.additional'` without the square brackets, as this is not an array index.

**Are you going to resolve the issue?**

I don't know enough about Ajv to be able to.

Here's a runkit test-case for easy reproduction:

https://runkit.com/lehni/ajv-additionalproperties