# [416] Switch statement weirdness

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
4.11.2


**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

```javascript
{ v5: true, allErrors: true }
```

**JSON Schema (please make it as small as possible to reproduce the issue):**

```json
var Ajv = require('ajv');
ajv = new Ajv({ "v5": true, "allErrors": true });

var schema = {
    "type": "object",
    "properties": {
        "type": {
            "type": "string",
            "enum": ["authenticate", "get"]
        },
        "payload": {
          "type": "object",
          "switch": [
            {
              "if": { "properties": { "type": {"constant": "authenticate"} } },
              "then": {
                "properties": {
                  "token": {
                    "description": "Token [...]",
                    "type": "string"
                  }
                },
                "required": ["token"]
              }
            },
            {
              "if": { "properties": { "type": {"constant": "get"} } },
              "then": {
                "properties": {
                  "information": {
                    "type": "string",
                    "enum": ["relation"]
                  }
                },
                "required": ["information"]
              }
            }
          ]
        }
    },
    "additionalProperties": false
};
```


**Data (please make it as small as posssible to reproduce the issue):**

```json
var data = {
  "type": "authenticate",
  "payload": {
    "token": "token"
  }
};

var data2 = {
  "type": "get",
  "payload": {
    "information": "relation"
  }
};
```


**Your code (please use `options`, `schema` and `data` as variables):**

```javascript
var validate = ajv.compile(schema);
console.log(validate(data)); // 'true', OK
console.log(validate.errors); // 'null', OK

console.log(validate(data2)); // 'false'
console.log(validate.errors));
```
Last command outputs:
>[ { keyword: 'required',
    dataPath: '.payload',
    schemaPath: '#/properties/payload/switch/0/then/required',
    params: { missingProperty: 'token' },
    message: 'should have required property \'token\'' } ]

Which means it validated against the first `if` of the `switch` statement.
Runkit [here](https://runkit.com/dvergeylen/58a2f1fe706a400014600068)
<!--
It would help if you post a working code sample in Tonic notebook and include the link here. You can clone this notebook: https://tonicdev.com/esp/ajv-issue.
-->


**What results did you expect?**
I would have expect `data2` to be validated against the second `if` statement of the `swtich`. I can't figure out what I am doing wrong.

**Are you going to resolve the issue?**
I am not even sure I am using this correctly! :laughing: 