# [480] `select`/`selectCases` have issues with `additionalProperties`

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

5.0.1
yes it happens in the latest version

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{ $data: true }
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "option": {}
  },
  "select": {
    "$data": "0/option"
  },
  "selectCases": {
    "a": {
      "required": [
        "a"
      ],
      "properties": {
        "a": {
          "type": "string"
        }
      }
    }
  }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json

{ 
  "option": "a", 
  "a": "xxx"
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
var keywords = require('ajv-keywords');
var ajv = new Ajv(options);
keywords(ajv);
var validate = ajv.compile(schema);
var valid = validate(data);
if (!valid) console.log(validate.errors);

```
https://runkit.com/beeplin/590a0e9406df05001212c1b6

**Validation result, data AFTER validation, error messages**

```
[ { keyword: 'additionalProperties',
    dataPath: '',
    schemaPath: '#/additionalProperties',
    params: { additionalProperty: 'a' },
    message: 'should NOT have additional properties' } ]

```

**What results did you expect?**

It should pass the validation, which means `addtionalProperties` should also take count in those `properties` under `selectCases`.
