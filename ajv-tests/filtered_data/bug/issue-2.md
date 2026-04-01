# [2] Root ref in ref doesn't work

Test: https://github.com/epoberezkin/ajv/blob/master/spec/tests/issues/2_root_ref_in_ref.json

This is not working:

```
{
  definitions: {
    arr: {
       type: 'array',
       items: { $ref: '#' }
    }
  },
  type: 'object',
  properties: {
    name: { type: 'string' },
    children: { $ref: '#/definitions/arr' }
  }
}
```

 # in `arr` refers to `#/definitions/arr` (wrong) rather than to the root (correct)
