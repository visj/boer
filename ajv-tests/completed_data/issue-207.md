# [207] should `undefined` for type be valid?

```
{
  type: 'object',
  properties: {
    id: { type: undefined }
  }
}
```

I expected this to throw a validation error, but it doesn't. Is that a bug?
