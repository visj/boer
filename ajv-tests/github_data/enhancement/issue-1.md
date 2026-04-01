# [1] # IDs in refs without root id don't work

See this test: https://github.com/epoberezkin/ajv/blob/master/spec/tests/issues/1_ids_in_refs.json

This is not working:

```
{
  definitions: {
    integer: {
      id: '#integer',
      type: 'integer'
    }
  },
  $ref: '#integer'
}
```

This works though:

```
{
  id: 'http://example.com/integer.json',
  definitions: {
    integer: {
      id: '#integer',
      type: 'integer'
    }
  },
  $ref: '#integer' 
}
```

This is ok too:

```
{
  definitions: {
    integer: {
      type: 'integer'
    }
  },
  $ref: '#/definitions/integer' 
}
```
