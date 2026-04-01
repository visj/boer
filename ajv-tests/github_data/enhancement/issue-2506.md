# [2506] Format for validation results

**What version of Ajv you are you using?**
8.17.1

**What problem do you want to solve?**
The current validate result is an array, but I expect the error result to correspond to the input field.
Is that feature already provided?

**What do you think is the correct solution to problem?**
example validation code
```
import Ajv from 'ajv'
const ajv = new Ajv({ allErrors: true })

const schema = {
  type: 'object',
  properties: {
    foo: { type: 'integer', minLength: 5 },
    bar: { type: 'integer' },
  },
  required: ['foo'],
  additionalProperties: false,
}

const data = {
  foo: 'a',
  bar: 'b',
}

const validate = ajv.compile(schema)
const valid = validate(data)
if (!valid) console.log(validate.errors)
```

current validation result
```
[
  {
    instancePath: '/foo',
    schemaPath: '#/properties/foo/type',
    keyword: 'type',
    params: { type: 'integer' },
    message: 'must be integer'
  },
  {
    instancePath: '/foo',
    schemaPath: '#/properties/foo/minLength',
    keyword: 'minLength',
    params: { limit: 5 },
    message: 'must NOT have fewer than 5 characters'
  },
  {
    instancePath: '/bar',
    schemaPath: '#/properties/bar/type',
    keyword: 'type',
    params: { type: 'integer' },
    message: 'must be integer'
  }
]
```

ideal result
```
{
  foo: [
    {
      instancePath: '/foo',
      schemaPath: '#/properties/foo/type',
      keyword: 'type',
      params: { type: 'integer' },
      message: 'must be integer',
    },
    {
      instancePath: '/foo',
      schemaPath: '#/properties/foo/minLength',
      keyword: 'minLength',
      params: { limit: 5 },
      message: 'must NOT have fewer than 5 characters',
    },
  ],
  bar: [
    {
      instancePath: '/bar',
      schemaPath: '#/properties/bar/type',
      keyword: 'type',
      params: { type: 'integer' },
      message: 'must be integer',
    },
  ],
}
```


**Will you be able to implement it?**
It is possible to add the optional setting to change the format of the validation results as part of the [Validation and reporting options](https://ajv.js.org/options.html#validation-and-reporting-options).
