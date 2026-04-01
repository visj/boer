# [286] 'patternProperties' overrides 'properties'

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

4.5.0

**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

``` javascript
{
  allErrors: true,
  verbose: true
}
```

**JSON Schema (please make it as small as possible to reproduce the issue):**

``` json
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type": "object",
    "properties": {
        "test" : { "type" : "string" }     
    },
    "patternProperties" : {
        "^.*$" : 
        {                                             
                "type": "boolean"
        }
    },
    "additionalProperties": false,
    "uniqueProperties" : true     
}
```

**Data (please make it as small as posssible to reproduce the issue):**

``` json
{ "test" : "example" }
```

**Your code (please use `options`, `schema` and `data` as variables):**

Using your Tonic example:

``` javascript
var Ajv = require('ajv');
var ajv = Ajv({allErrors: true, verbose: true});

var schema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type": "object",
    "properties": {
        "test" : { "type" : "string" }     
    },
    "patternProperties" : {
        "^.*$" : 
        {                                             
                "type": "boolean"
        }
    },
    "additionalProperties": false,
    "uniqueProperties" : true     
};

var validate = ajv.compile(schema);

test({ "test" : "example" });

function test(data) {
  var valid = validate(data);
  if (valid) console.log('Valid!');
  else console.log('Invalid: ' + ajv.errorsText(validate.errors));
}
```

<!--
It would help if you post a working code sample in Tonic notebook and include the link here. You can clone this notebook: https://tonicdev.com/esp/ajv-issue.
-->

**Validation result, data AFTER validation, error messages:**

```
"Invalid: data['test'] should be boolean"
```

**What results did you expect?**

It appears that 'patternProperties' overrides the standard 'properties' field.  I would expected this to pass without issue as 'test' is defined as a string, not a Boolean.  A similar example is shown on the json-schema site here: http://json-schema.org/example2.html .  This shows both 'properties' and 'patternProperties' being used.

**Are you going to resolve the issue?**

I will attempt to find and fix this issue, but would appreciate someone who is more familiar with the code base looking in to this as well.
