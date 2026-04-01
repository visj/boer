# [133] Object with property named 'type' does not validate as required

Given the following, the 'type' property does not fail the 'required' validation.  Works as expected for 'foo' and 'percent'.

```
tax: {
  type: 'object',
  required: ['type', 'percent', 'foo'],
  additionalProperties: false,
  properties: {
    type: {
      type: 'string'
    },
    percent: {
      type: 'number',
      minimum: 0,
      maximum: 100
    },
    foo: {
      type: 'string'
    }
  }
}
```
