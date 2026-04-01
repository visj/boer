# [681] [request] $data reference for `default` keyword.

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
I'm looking at 6.0.0 docs, which state `$data reference` is not available for the `default` keyword (https://github.com/epoberezkin/ajv#data-reference).


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{ allErrors: true }
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "properties": {
    "defaultNumber": {
      "type": "integer",
    },
    "numbers": {
      "type": "object",
      "additionalProperties": { "$ref": "#/definitions/myRef" },
    },
  },
  "definitions": {
    "myRef": {
      "type": "object",
      "properties": {
        "value": { "type": "integer" },
        "defaultValue": {
          "type": "integer",
          "default": { "$data": "/defaultNumber" }
        },
      }
    },
  },
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
  "defaultNumber": 3,
  "numbers": {
    "one": { "value": 1 }
  }
}
```


**Your code**
```javascript
var Ajv = require("ajv");
var ajv = new Ajv({ allErrors: true });

var schema = {
  "properties": {
    "defaultNumber": {
      "type": "integer",
    },
    "numbers": {
      "type": "object",
      "additionalProperties": { "$ref": "#/definitions/myRef" },
    },
  },
  "definitions": {
    "myRef": {
      "type": "object",
      "properties": {
        "value": { "type": "integer" },
        "defaultValue": {
          "type": "integer",
          "default": { "$data": "/defaultNumber" }
        },
      }
    },
  },
};

var validate = ajv.compile(schema);

test({
  "defaultNumber": 3,
  "numbers": {
    "one": { "value": 1 }
  }
});


function test(data) {
  var valid = validate(data);
  console.log(data.numbers.one)
  if (valid) console.log("Valid!");
  else console.log("Invalid: " + ajv.errorsText(validate.errors));
}
```

**Validation result, data AFTER validation, error messages**

```
{
  "defaultNumber": 3,
  "numbers": {
    "one": { "value": 1 }
  }
}
```

**What results did you expect?**
I would like to have `numbers.one.default` to be filled in with the number 3 (from `defaultNumber` at root).
```
{
  "defaultNumber": 3,
  "numbers": {
    "one": {
      "value": 1,
      "default": 3
    }
  }
}
```


**Are you going to resolve the issue?**
I'm not sure, is this a reasonable request to begin with?