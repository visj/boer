# [991] Bug: Merge schemas with required properties

When using `ajv-merge-patch` module...

Given schema1
```
{
  type: 'object',
  properties: {
     properties: {
        foo: { type: "string" }
      },
  },
  required: ["foo"]
}
```

And given schema2
```
{
  $merge: {
    source: schema1,
    with: {
      type: 'object',
      properties: {
        bar: { type: "string" }
      },
      required: ["baz"]
    }
  }
}
```

I expect `foo` and `bar` to be required in schema2.
Instead, only `bar` is required.