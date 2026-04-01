# [650] if/then/else applying wrong schema if target property is not present


Ajv version: **^6.0.0-rc.1**

**JSON Schema**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",

  "type": "object",
  "properties": {
    "firstName": {
      "type": "string"
    },
    "countryOfBirth": {
      "type": "string",
      "enum": [
        "England",
        "Italy"
      ]
    },
    "cityOfBirth": {
      "type": "string"
    }
  },
  "required": ["firstName"],
  "if": {"properties": {"countryOfBirth": {"pattern": "^England$"}}},
  "then": {"required": ["cityOfBirth"]}
}

```
**Sample data**

```json
{
  "firstName": "Emma"
}
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

function runValidation(inputSchema, submittable) {
  var validate = ajv.compile(inputSchema);
  var valid = validate(submittable);
  if (valid) {
    return { result: 'Valid!'};
  } else {
    return { result: 'Invalid: ' + ajv.errorsText(validate.errors)};
  }
}
```


**Validation result, data AFTER validation, error messages**

```
'Invalid: data should have required property \'cityOfBirth\', data should match "then" schema'
```

**What results did you expect?**
I would expect this object to be valid against the given schema. 

The property `countryOfBirth` is not required, when it's present it's being evaluated correctly. Adding an `else` block has no impact on this behaviour. This happens even when multiple `if/then/else` blocks are in place, the schema applied in the one for the first `if`.