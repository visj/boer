# [2552] unevaluatedProperties errors does not notify about all unevaluatedProperties

**What version of Ajv you are you using?**
8.0
**What problem do you want to solve?**
when there are errors for unevaluatedProperties, the errors object only shows the first unevaluatedProperty encountered

Example:
```
    import Ajv2020 from 'ajv/dist/2020'

    const ajv8 = new Ajv2020()
    
    ajv8.addSchema(
        {
            type: 'object',
            properties: {
                a: {type: 'string'}
            },
            unevaluatedProperties: false
        },
        'test'
    )

    ajv8.validate('test', {
        a: 'a',
        b: 'b',
        c: 'c'
    })

    expect(ajv8.errors).toEqual([{
  "instancePath": "",
  "schemaPath": "#/unevaluatedProperties",
  "keyword": "unevaluatedProperties",
  "params": {
    "unevaluatedProperties": ["b", "c"]
  },
  "message": "must NOT have unevaluated properties"
}])
```

but actual:
```
{
  "instancePath": "",
  "schemaPath": "#/unevaluatedProperties",
  "keyword": "unevaluatedProperties",
  "params": {
    "unevaluatedProperty": "b"
  },
  "message": "must NOT have unevaluated properties"
}
```

also could have one error like the above for b and one for c, but a single error with multiple properties is much more concise, and is obvious that it is related to the same schemaPath evaluation

**What do you think is the correct solution to problem?**
I understand this is probably to "fail fast". However, since this is useful, I would add a new option to AJV: reportAllUnevaluated: boolean

If it is true, AJV will consider to iterate the rest of the properties to evaluate them, and then in the errors it should report all of them. Preferably, there would be a single error with an array of all unevaluated properties in the params

**Will you be able to implement it?**
Possibly, I need to check the AJV codebase...