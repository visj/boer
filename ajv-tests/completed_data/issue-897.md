# [897] Wrong results with {removeAdditional: 'failing', allErrors: false} and additionalProperties as failing schema

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
I test it with latest AJV V6.6.1. Yes, it is.


**Ajv options object**

```
{
  "removeAdditional": "failing",
  "allErrors": false
}
```

**JSON Schema**

```
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "requiredProperty": {
      "type": "boolean"
    }
  },
  "required": [
    "requiredProperty"
  ],
  "additionalProperties": {
    "not": {}
  }
}
```


**Sample data**

```
{
  "foo": 0
}
```


**Your code**

```
var Ajv = require('ajv');
var ajv = new Ajv(options); 
var validate = ajv.compile(schema);
var valid = validate(data); //true - but must be false
console.log(validate.errors); // validate.errors !== null
console.log(data); // {} - foo is removed
```

**Errors**
```
[ 
  {
     keyword: 'not',
     dataPath: '[\'foo\']',
     schemaPath: '#/additionalProperties/not',
     params: {},
     message: 'should NOT be valid' 
  } 
]
```

**What results did you expect?**
I expect:
1. `valid === false` (-)
2. `foo` removed (+)
3.  `validate.errors` not null and does not contain error about additionalProperty `foo`, because `foo` is removed from data. (-)

**Are you going to resolve the issue?**
I test it with latest AJV V6.6.1.
I write test and check all other combinations of `removeAdditional` and `allErrors` options and `additionalProperties` schema value. Here is a code (with AJV v4.11.5) http://plnkr.co/edit/ZIPWAn5HB2Ele4YgGVil?p=info
It seems like a bug, or I don't understand behavior.