# [631] if/then/else not working when checking a string value?

**What am I trying to do?**
I want to check that if a property in my json object has a given value then other property is required to be present.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
I'm using: `"ajv": "^6.0.0-beta.2"`

**JSON Schema**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "An example schema",
  
  "type": "object",
  "properties":{
    "a": {
      "type": "string"
    },
    "b": {
      "type": "integer"
    },
    "c": {
      "type": "string",
      "enum": [
        "abc",
        "def",
        "ghi",
        "jkl"
      ]
    }
  },
  "if": {"properties/c": {"pattern": "^ghi$" }},
  "then": {"required": ["a", "b", "c"]},
  "else": {"required": ["a", "c"]}
}
```

**Sample data**
```json
{
  "a": "a string",
  "c": "abc"
}
```

**My code**
```javascript
var Ajv = require('ajv');
var ajv = new Ajv({allErrors: true});
const fs = require('fs');

var schema = JSON.parse(fs.readFileSync('schemas/example-schema.json'));
var validate = ajv.compile(schema);

var inputExample = JSON.parse(fs.readFileSync('objects/example.json'));
test(inputExample);

function test(data) {
  var valid = validate(data);
  if (valid) {
    console.log('Valid!');
  } else {
    console.log('Invalid: ' + ajv.errorsText(validate.errors));
  }
}
```

**Validation result, data AFTER validation, error messages**
```
Invalid: data should have required property 'b', data should match "then" schema
```

**What results did you expect?**
I would expect the example json to pass validation as the`if` clause is not true and the data matches the `else` clause: `"required": ["a", "c"]`.

**Are you going to resolve the issue?**
I'm not sure if my `if/the/else` syntax is wrong, or the if clause is wrongly expressed, if it is a bug or since it's a beta version it's not yet implemented?

Thanks in advance for any feedback I get on this issue.