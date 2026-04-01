# [719] minimum makes an optional key required

Hi.
With this example:

```
maximum: {
  type: 'number',
  minimum: { $data: '1/minimum' },
},
```

I expect `minimum` to be applied only when `maximum` is defined. But it is applied to undefined `maximum` which looks like block for JSON schema.

Did I miss anything?