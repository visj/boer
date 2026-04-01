# [934] `nullable` property of JSON object as described by OpenAPI Spec v3 should be a boolean.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.8.1


**Ajv options object**

```javascript
{nullable: true}
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{"type":"string", "nullable": false}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{"hello": "worl"}
```


**Your code**

```javascript
var Ajv = require('ajv');
var ajv = new Ajv({nullable: true});
var valid = ajv.validate({"type":"string", "nullable": false}, { 'hello': "worl" });
```


**Validation result, data AFTER validation, error messages**

```
Error: keyword schema is invalid: data should be equal to constant
    at Object.useCustomRule (/Users/matt/staging/cabochon/packages/monolith/node_modules/ajv/lib/compile/index.js:264:20)
    at Object.generate_custom [as code] (/Users/matt/staging/cabochon/packages/monolith/node_modules/ajv/lib/dotjs/custom.js:32:24)
    at Object.generate_validate [as validate] (/Users/matt/staging/cabochon/packages/monolith/node_modules/ajv/lib/dotjs/validate.js:353:35)
    at Object.generate_properties [as code] (/Users/matt/staging/cabochon/packages/monolith/node_modules/ajv/lib/dotjs/properties.js:195:26)
    at generate_validate (/Users/matt/staging/cabochon/packages/monolith/node_modules/ajv/lib/dotjs/validate.js:353:35)
    at localCompile (/Users/matt/staging/cabochon/packages/monolith/node_modules/ajv/lib/compile/index.js:88:22)
    at Ajv.compile (/Users/matt/staging/cabochon/packages/monolith/node_modules/ajv/lib/compile/index.js:55:13)
    at Ajv._compile (/Users/matt/staging/cabochon/packages/monolith/node_modules/ajv/lib/ajv.js:346:27)
    at Ajv.validate (/Users/matt/staging/cabochon/packages/monolith/node_modules/ajv/lib/ajv.js:94:36)
    at ReadStream.<anonymous> (/Users/matt/staging/cabochon/packages/monolith/test.js:14:19)
```

**What results did you expect?**
Successful validation of the schema.

**Are you going to resolve the issue?**
Yes, I have a PR ready to open.

I want to note that this issue was briefly touched on at the end of the conversation around https://github.com/epoberezkin/ajv/issues/486 as well.

Although the documentation does say that `nullable` should default to `false`, there is no indication that specifying `"nullable": false` explicitly should not be allowed. The exact wording is 

"Allows sending a null value for the defined schema. Default value is false." 

To draw contrast to this, the document describes the `required` field of a Parameter Object with the following wording: 

"Determines whether this parameter is mandatory. If the parameter location is "path", this property is REQUIRED and its value MUST be true. Otherwise, the property MAY be included and its default value is false."

