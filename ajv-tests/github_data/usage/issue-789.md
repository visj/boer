# [789] Incorrect behavior of additionalProperties inside of IF construction

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Checked on 6.5.0 and 6.1.1. Issue is valid for both (6.5.0 is latest currently)


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->
Nothing was changed from default state
```javascript


```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "object",
  "properties": {
    "occurs": {
      "type": "object", 
      "properties": { 
        "recurrentType": { "enum": ["oneTime", "daily"] }
      },      
      "if": { "properties": { "recurrentType": {"const": "oneTime"}}},
      "then": { 
        "properties": {"onceAt": {"type": "string", "format": "date-time"}},
        "required": ["onceAt"]
      },
      "else": {
          "properties": { "recursEvery": {"type": "integer", "minimum": 1}},
          "required": ["recursEvery"] 
      }, 
      "additionalProperties": false   
    }
  }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{"occurs": {
            "recurrentType": "oneTime", 
            "onceAt": "2016-05-18T16:00:00Z"
          } }
```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
var Ajv = require('ajv');
  var ajv = new Ajv({allErrors: true});
  
  var schema = {
    "type": "object",
    "properties": {
      "occurs": {
        "type": "object", 
        "properties": { 
          "recurrentType": { "enum": ["oneTime", "daily"] }
        },      
        "if": { "properties": { "recurrentType": {"const": "oneTime"}}},
        "then": { 
          "properties": {"onceAt": {"type": "string", "format": "date-time"}},
          "required": ["onceAt"]
        },
        "else": {
            "properties": { "recursEvery": {"type": "integer", "minimum": 1}},
            "required": ["recursEvery"] 
        }, 
        "additionalProperties": false   //For some unknown reason it doesn't work. Ajv considers correct properties as additional inside IF
      }
    }
  };
  
  var validate = ajv.compile(schema);
  
  test({"occurs": {
            "recurrentType": "oneTime", 
            "onceAt": "2016-05-18T16:00:00Z"
          } });
  
  function test(data) {
    var valid = validate(data);
    if (valid) console.log('Valid!');
    else console.log('Invalid: ' + ajv.errorsText(validate.errors));
  }
```


**Validation result, data AFTER validation, error messages**

```
Invalid: data.occurs should NOT have additional properties
```

**What results did you expect?**
Expectation was: schema is valid as no any other properties except 'recurrentType' and 'onceAt' are mentioned in data. For some unknown reason it doesn't work. Ajv considers correct properties as additional inside IF

**Are you going to resolve the issue?**
Not sure if my js Kung fu level is high enough for that
