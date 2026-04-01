# [1718] Assigning defaults for nested schema doesn't work

I tried this but it didn't work:
```

const ajv = new Ajv({ useDefaults: true })
  const schema = {
    type: 'object',
    properties: {
      foo: { type: 'number' },
      bar: {
        type: 'object',
        properties: {
          zoo: { type: 'string', default: 'deffff' },
        },
      },
    },
    required: ['foo', 'bar'],
  }

  const data = {}
  const validate = ajv.compile(schema)
  const valid = validate(data)
  console.log(data)
```