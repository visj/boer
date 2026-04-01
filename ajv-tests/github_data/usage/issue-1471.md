# [1471] enum doesn't play well together with nullable

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

v7.1.1, latest

**Ajv options object**

```js
{
  strict: false,
  allErrors: true,
  ownProperties: true,
  passContext: true,
  useDefaults: true,
  validateSchema: true
}
```

**JSON Schema**

```json
const schema = {
  "$id": "test",
  "properties": {
    "myEnum": {
      "type": ["string"],
      "nullable": true,
      "enum": [
        "one",
        "two",
        "three"
      ]
    }
}
```

**Sample data**

```json
{
  "myEnum": null
}
```

**Validation result, data AFTER validation, error messages**

```
ERROR: [
  {
    keyword: 'enum',
    dataPath: '/myEnum',
    schemaPath: '#/properties/myEnum/enum',
    params: { allowedValues: [Array] },
    message: 'should be equal to one of the allowed values'
  }
]
```

**What results did you expect?**

`nullable: true` should affect the `enum` keyword validation.

We've been here before, see #824, but now that `nullable` is a keyword, let's revisit this question?

**Are you going to resolve the issue?**

I could try.