# [746] Cannot verify the required object properties in an array.

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

6.3.0.

Yes.

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->



```javascript

{allErrors: true}

```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json

{
    "title": "ARRs",
    "type": "object",
    "properties": {
        "ARRs": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "title": "Name"
                    }
                },
                "required": ["name"]
            }
        }
    }
}

```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json

vsds: [{}]}

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
    "title": "ARRs",
    "type": "object",
    "properties": {
        "ARRs": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "title": "Name"
                    }
                },
                "required": ["name"]
            }
        }
    }
}


var validate = ajv.compile(schema);

test({vsds: [{}]});

function test(data) {
  var valid = validate(data);
  if (valid) console.log('Valid!');
  else console.log('Invalid: ' + ajv.errorsText(validate.errors));
}

```


**Validation result, data AFTER validation, error messages**

```
Valid!

```

**What results did you expect?**

Error! The name is required.