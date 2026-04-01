# [857] AJV is reporting the missing of required properties incorrectly

AJV is reporting the property name incorrectly. here is the code sample

AJV version: 6.5.3

```javascript
var Ajv = require('ajv');
var ajv = new Ajv({allErrors: false});

var schema = {
  "type":"object",
  "allOf":[
  {
      "properties": {
        "foo": { "type": "string" },
        "bar": { "type": "number", "maximum": 3 }
      }
  },
  { 
  "if": {
     "properties": {
        "foo": { 
            "const": "abc" 
        }
      }
    },
    "then":{"required": ['bar']},
    }
  ]  
};

var validate = ajv.compile(schema);

test({"foo": "abc"});

function test(data) {
  var valid = validate(data);
  if (valid) console.log('Valid!');
  else console.log('Invalid: ' + ajv.errorsText(validate.errors));
}
```

**Problem**

AJV is reporting that the missing required property and that's expected but it reports the name of the property incorrectly. It adds the prefix `.`(dot) => `Invalid: data should have required property '.bar'` and the only way for it to report the property correctly is if I instantiate AJV with `{allErrors: true}`

**Expectation**
I was expecting to observe the following error message: `Invalid: data should have required property 'bar'` without the `.` dot prefix when using any of this options: `{allErrors: true}` or ``{allErrors: false}`.

**Are you going to resolve the issue?**
I might be willing to try.
