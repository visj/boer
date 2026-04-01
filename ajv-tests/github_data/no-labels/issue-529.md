# [529] const and $data example seems broken

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
5.2.0 - tried in node repl link: https://npm.runkit.com/ajv

was able to repro by pasting code below.

**Ajv options object**
{}


**JSON Schema**
 {
    "properties": {
        "foo": { "type": "number" },
        "bar": { "const": { "$data": "1/foo" } }
    }
};

```json
{"foo": 1, "bar": 1}
```

**Your code**

```javascript
var Ajv = require('ajv');
var ajv = new Ajv({allErrors: true});

var schema = {
    "properties": {
        "foo": { "type": "number" },
        "bar": { "const": { "$data": "1/foo" } }
    }
};

var validate = ajv.compile(schema);

test({"foo": 1, "bar": 1});

function test(data) {
  var valid = validate(data);
  if (valid) console.log('Valid!');
  else console.log('Invalid: ' + ajv.errorsText(validate.errors));
}
```

**Validation result, data AFTER validation, error messages**
  "Invalid: data.bar should be equal to constant"

**What results did you expect?**
No errors.

**Are you going to resolve the issue?**
No - I can if given guidance.