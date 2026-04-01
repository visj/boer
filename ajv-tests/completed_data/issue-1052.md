# [1052] "if" field always passes even with not existent required fields.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
`"ajv": "^6.10.2",`

**Ajv options object**
```
{
    allErrors: true,
    verbose: true
}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": [
    "Locations",
    "UserArea"
  ],
  "properties": {
    ...
    "Locations": {
      "if": {
        "required": ["UserArea"],
        "properties": {
          "UserArea": {
            "required": ["PublishToBA"],
            "properties": {
              "PublishToBA": {
                "const": true
              }
            }
          }
        }
      },
      "then": false,
      "else": false
    },
    ...
  }
}

```

**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```
{
  "Locations": [
    {
      ...
    }
  ],
  ...
  "UserArea": {
    "PublishToBA": false
  },
  ...
}

```

**Validation result, data AFTER validation, error messages**

```
[ { keyword: 'false schema',
    dataPath: '.Locations',
    schemaPath: '#/properties/Locations/then/false schema',
    params: {},
    message: 'boolean schema is false',
    schema: false,
    parentSchema: false,
    data: [ [Object] ] },
  { keyword: 'if',
    dataPath: '.Locations',
    schemaPath: '#/properties/Locations/if',
    params: { failingKeyword: 'then' },
    message: 'should match "then" schema',
    schema: { required: [Array], properties: [Object] },
    parentSchema: { if: [Object], then: false, else: false },
    data: [ [Object] ] } ]
```

**What results did you expect?**
I expect that "if" field fails and "else" field will be involved. But I got "then" branch execution regardless on PublishToBA value (I tried to put there anything), regardless on "then"/"else" content (so I simplified it to "false"), even regardless on "if" content - even I put there not existent fields like "require":["ololo"] it will execute "then" branch. I tried to use "enum" instead of "const", but it still not working.

Update:
It's so strange because even this code below makes data valid (but shouldn't)
```
"Locations": {
    "if": {
      "required": ["olololo"]
    },
    "then": true,
    "else": false
},
```
Result is `true` (
