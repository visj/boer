# [1016] null type in conjunction with string enum breaks schema compilation

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Ajv 6.10.0


**Ajv options object**
_default options only_

**JSON Schema**

```json
{
  "type": "object",
  "properties": {
    "enumVal": {
      "type": [
        {
          "type": "string",
          "enum": [
            "A",
            "B",
            "C"
          ]
        },
        "null"
      ]
    }
  }
}
```


**Sample data**

```json
{
  "enumVal": null
}
```


**Your code**

```javascript
const Ajv = require('ajv');
const assert = require('assert');

const schema = {
  type: 'object',
  properties: {
    enumVal: {
      type: [
        {
          type: 'string',
          enum: ['A', 'B', 'C'],
        },
        'null',
      ],
    },
  },
};

const obj = {
  enumVal: null,
};

const validate = new Ajv().compile(schema);
assert(validate(obj) === true);
```


**Validation result, data AFTER validation, error messages**

The following error is thrown during compilation of the schema:
```
Error: schema is invalid: data.properties['enumVal'].type should be equal to one of the allowed values, data.properties['enumVal'].type[0] should be equal to one of the allowed values, data.properties['enumVal'].type should match some schema in anyOf
    at Ajv.validateSchema (/Users/aske/Repos/dvka/viba/webapp/node_modules/ajv/lib/ajv.js:177:16)
    at Ajv._addSchema (/Users/aske/Repos/dvka/viba/webapp/node_modules/ajv/lib/ajv.js:306:10)
    at Ajv.compile (/Users/aske/Repos/dvka/viba/webapp/node_modules/ajv/lib/ajv.js:112:24)
    at Object.<anonymous> (/Users/aske/Repos/dvka/viba/webapp/src/app/sections/common/vorgang-details-editor/enum-nullable.js:27:28)
    at Module._compile (module.js:652:30)
    at Object.Module._extensions..js (module.js:663:10)
    at Module.load (module.js:565:32)
    at tryModuleLoad (module.js:505:12)
    at Function.Module._load (module.js:497:3)
    at Function.Module.runMain (module.js:693:10)
```

**What results did you expect?**
The given object should be valid against the given schema is the `null` type is valid. I also testet with https://www.jsonschemavalidator.net where the object validates against the schema.

This is related to #824 but there the enum is defined one level above, so I think there is still an issue with the schema given in this issue. Nevertheless it works with `oneOf`:
```
oneOf: [
  {
    type: 'string',
    enum: ['A', 'B', 'C'],
  },
  {
    type: 'null',
  },
],
```

**Are you going to resolve the issue?**
No