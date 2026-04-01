# [311] Unexpected identifier with export union type

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

4.7.4

**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

``` javascript

None, default.

```

**JSON Schema (please make it as small as possible to reproduce the issue):**

``` json

{
    "type": "object",
    "properties": {
        "field": {
            "$ref": "#/definitions/\"main\".IPaneType"
        }
    },
    "definitions": {
        "\"main\".IPaneType": {
            "type": "string",
            "enum": [
                "filter",
                "card",
                "table",
                "filter-as-table",
                "search-filter"
            ]
        }
    },
    "$schema": "http://json-schema.org/draft-04/schema#"
}

```

**Data (please make it as small as posssible to reproduce the issue):**

``` json

{
    "field": "filter"
}
```

**Your code (please use `options`, `schema` and `data` as variables):**

``` javascript
var fs = require("fs");
var schema = JSON.parse(fs.readFileSync("schema1.json",'utf-8'));
var data = JSON.parse(fs.readFileSync("sample1.json",'utf-8'));

// AJV

var ajvM = require("ajv");
var options = {}
var ajv = new ajvM(options);
var vl = ajv.compile(schema); // will fail
console.log(vl(data));
console.log(vl.errors);

```

<!--
It would help if you post a working code sample in Tonic notebook and include the link here. You can clone this notebook: https://tonicdev.com/esp/ajv-issue.
-->

**Validation result, data AFTER validation, error messages:**

```
Error compiling schema, function code: var refVal1 = refVal[1]; var validate =  (function  (data, dataPath, parentData, parentDataProperty, rootData) { 'use strict'; var vErrors = null;  var errors = 0;      if (rootData === undefined) rootData = data; if ((data && typeof data === "object" && !Array.isArray(data))) {   var errs__0 = errors;var valid1 = true; var data1 = data.field;  if (data1 === undefined) { valid1 = true; } else {   var errs_1 = errors;    var errs_2 = errors;   var schema2 = refVal1.enum;var valid2;valid2 = false;for (var i2=0; i2<schema2.length; i2++) if (equal(data1, schema2[i2])) { valid2 = true; break; } if (!valid2) {    validate.errors = [ { keyword: 'enum' , dataPath: (dataPath || '') + '.field' , schemaPath: "#/definitions/"main".IPaneType/enum" , params: { allowedValues: schema2 }  , message: 'should be equal to one of the allowed values'  } ]; return false;  }
 if (errors === errs_2) {  if (typeof data1 !== "string") {    validate.errors = [ { keyword: 'type' , dataPath: (dataPath || '') + '.field' , schemaPath: "#/definitions/"main".IPaneType/type" , params: { type: 'string' }  , message: 'should be string'  } ]; return false;  } }  var valid2 = errors === errs_2;     var valid1 = errors === errs_1; }     }  else {  validate.errors = [ { keyword: 'type' , dataPath: (dataPath || '') + "" , schemaPath: "#/type" , params: { type: 'object' }  , message: 'should be object'  } ]; return false;  }    validate.errors = vErrors;  return errors === 0;        }); return validate;return validate;
C:\TMP\typescript-json-schema\node_modules\ajv\lib\compile\index.js:162
      throw e;
      ^

SyntaxError: Unexpected identifier
    at localCompile (C:\TMP\typescript-json-schema\node_modules\ajv\lib\compile\index.js:130:26)
    at Ajv.compile (C:\TMP\typescript-json-schema\node_modules\ajv\lib\compile\index.js:59:13)
    at _compile (C:\TMP\typescript-json-schema\node_modules\ajv\lib\ajv.js:325:29)
    at Ajv.compile (C:\TMP\typescript-json-schema\node_modules\ajv\lib\ajv.js:111:34)
    at Object.<anonymous> (C:\TMP\typescript-json-schema\export-type-test\validate.js:10:14)
    at Module._compile (module.js:541:32)
    at Object.Module._extensions..js (module.js:550:10)
    at Module.load (module.js:458:32)
    at tryModuleLoad (module.js:417:12)
    at Function.Module._load (module.js:409:3)

```

**What results did you expect?**

To compile the schema and validate.

**Are you going to resolve the issue?**

Idk, might use another validation module. Depends on my time.
