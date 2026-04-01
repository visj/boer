# [271] Switch - "if" evaluated as "true" when property is missing

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

4.1.7

**Ajv options object:**

``` javascript
{
    v5: true,
    allErrors: true
}
```

**JSON Schema:**

``` json
{
    "type": "object",
    "properties": {
        "type": {
            "enum": [ "boolean", "number", "string" ]
        },
        "labelTrue": { "type": "string" },
        "labelFalse": { "type": "string" },
        "valueTrue": { "type": [ "string", "number" ] },
        "valueFalse": { "type": [ "string", "number" ] }
    },
    "required": [
        "type"
    ],
    "dependencies": {
        "labelTrue":  { "properties": { "type": { "constant": "boolean" } } },
        "labelFalse": { "properties": { "type": { "constant": "boolean" } } },
        "valueTrue":  { "properties": { "type": { "constant": "boolean" } } },
        "valueFalse": { "properties": { "type": { "constant": "boolean" } } }
    },
    "switch": [
        {
            "if": { "properties": { "type": { "constant": "boolean" } } },
            "then": {
                "required": [
                    "labelTrue",
                    "labelFalse",
                    "valueTrue",
                    "valueFalse"
                ]
            },
            "continue": true
        }
    ],
    "additionalProperties": false
}
```

**Data:**

``` json
{}
```

**Your code:**

[Tonic link](https://tonicdev.com/tvsbrent/57ac9b0523722e1700353adf)

**Validation result, data AFTER validation, error messages:**

```
{ keyword: 'required',
    dataPath: '',
    schemaPath: '#/required',
    params: { missingProperty: 'type' },
    message: 'should have required property \'type\'' },
  { keyword: 'required',
    dataPath: '',
    schemaPath: '#/switch/0/then/required',
    params: { missingProperty: 'labelTrue' },
    message: 'should have required property \'labelTrue\'' },
  { keyword: 'required',
    dataPath: '',
    schemaPath: '#/switch/0/then/required',
    params: { missingProperty: 'labelFalse' },
    message: 'should have required property \'labelFalse\'' },
  { keyword: 'required',
    dataPath: '',
    schemaPath: '#/switch/0/then/required',
    params: { missingProperty: 'valueTrue' },
    message: 'should have required property \'valueTrue\'' },
  { keyword: 'required',
    dataPath: '',
    schemaPath: '#/switch/0/then/required',
    params: { missingProperty: 'valueFalse' },
    message: 'should have required property \'valueFalse\'' }
```

**What results did you expect?**
I would expect only the first error, about the missing type property. It seems like the "if" condition in the switch is being evaluated as true when the property is missing.

**Do you intend to resolve the issue?**
Not sure I possess the ability to do so!
