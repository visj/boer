# [1965] [Proposal] no need to check `type`, if `enum` is provided

Given:

```ts
example: {
      type: `string`,
      enum: [`0`, `1`]
}
```

The following **shouldn't** be generated/checked:
- as it will be further checked as part of the `enum` check for the exact values

```ts
if (typeof data1 !== `string`) {
  const err0 = {
    instancePath: instancePath + `/example`,
    schemaPath: `#/properties/example`,
    keyword: `type`,
    params: { type: `string` },
  }
  if (vErrors === null) {
    vErrors = [err0]
  } else {
    vErrors.push(err0)
  }
  errors++
}
```

**What version of Ajv you are you using?** `8.11.0`

**What problem do you want to solve?** To have less generated code.

**What do you think is the correct solution to problem?** Not to check `type`, if `enum` is provided.

**Will you be able to implement it?** Yes
