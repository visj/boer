# [910] issues using "if/then/else" to set dynamic type based on const

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
6.6.2


**Ajv options object**
  schemaId: '$id',
  removeAdditional: 'all',
  useDefaults: true,
  allErrors: true
<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript


```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json

const schema = {
  "type": "object",
  "properties": {
    "propType": {
      "enum": [
        "n",
        "s"
      ]
    },
    "prop": {
      "if": { "properties": {"propType": {"const": "n"}},
        "then": {
          "type":"number"
        },
        "else": {
          "type": "string"
        }
    },

    }
  },
  "required": [
    "propType",
    "prop"
  ]
};

```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
  "badprop": 45,
  "propType": "n",
  "prop": "hi"
};

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

var validate = ajv.compile(schema);
var valid = validate(data);
if (!valid) console.log(validate.errors);
else console.log('OK!');
console.log(data)

```


**Validation result, data AFTER validation, error messages**
I was expecting an error, everything was fine:

```
OK!
{ propType: 'n', prop: 'hi' }

```

**What results did you expect?**
[ { keyword: 'type',
    dataPath: '.prop',
    schemaPath: '#/properties/prop/type',
    params: { type: 'number' },
    message: 'should be number' } ]
{ propType: 'n', prop: 'hi' }


**Are you going to resolve the issue?**
I'll keep on trying, no success so far.
