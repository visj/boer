# [2439] if/then false positive when if-property is undefined.

```
    "ajv": "^8.13.0",
    "ajv-errors": "^3.0.0",
```
```
    const ajv = new Ajv({ allErrors: true, verbose: true, $data: true });
```

I define this schema of an annotation object.

```
        annotation: {
            type: "object",
            properties: {
                pos: { ref:"" },
                verbform: { ref:"" },
                tense: { ref:"" },
                gender: { ref:"" },
            },
            required: [ "pos", "verbform"],
            allOf: [
                {
                    if: { properties: { verbform: { const: "fin" } } },
                    then: {
                        required: ["tense" ],
                        properties: { gender: { not: {} } }
                    }
                },
              ]
          }
```

I pass the following annotation: `{ pos: 'verb' }`

I expect only 1 error of 'required verbform`.

but also i get this error:
```
{
  instancePath: '',
  schemaPath: '#/allOf/0/then/required',
  keyword: 'required',
  params: { missingProperty: 'tense' },
  message: "must have required property 'tense'",
  schema: [ 'tense' ],
  parentSchema: {
    required: [ 'tense', ],
    properties: { gender: [Object] }
  },
  data: { pos: 'verb', lemma: 'poder' }
}
```
meaning that the `if: { properties: { verbform: { const: "fin" } } }` is somehow true for `{ pos: 'verb' }` ?! 