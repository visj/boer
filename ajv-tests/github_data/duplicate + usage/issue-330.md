# [330] Self referencing schema fails to compile

ajv version: 4.8.2
ajv options: {allErrors: true, v5: true}

General description:
I have a problem compiling a circular, self referencing schema -

**JSON Schema**

``` json
{
  "type": "object",
  "id": "dialog",
  "properties": {
    "steps": { "$ref": "#steps" },
  },
  "definitions": {
    "steps": {
      "id": "#steps",
      "type": "array",
      "items": {
        "type": "object",
        "oneOf": [
          {
            "id": "step",
            "type": "object",
            "properties": {
              "steps": {
                "$ref": "#steps"
              }
            }
          }
        ]
      }
    }
  }
}
```

**Code**

``` javascript
var Ajv = require('ajv');
var ajv = Ajv({allErrors: true, v5: true});

var schema = {...};
var validate = ajv.compile(schema);

```

**Result**
I expect this schema to compile, but I see the following exception:

```
        throw $error;
        ^

Error: can't resolve reference #steps from id step
    at Object.generate_ref [as code] (c:\temp\ajv-test\node_modules\ajv\lib\dotjs\ref.js:62:22)
    at Object.generate_validate [as validate] (c:\temp\ajv-test\node_modules\ajv\lib\dotjs\validate.js:157:37)
    at Object.generate_properties [as code] (c:\temp\ajv-test\node_modules\ajv\lib\dotjs\properties.js:198:26)
    at Object.generate_validate [as validate] (c:\temp\ajv-test\node_modules\ajv\lib\dotjs\validate.js:230:37)
    at Object.generate_oneOf [as code] (c:\temp\ajv-test\node_modules\ajv\lib\dotjs\oneOf.js:31:27)
    at Object.generate_validate [as validate] (c:\temp\ajv-test\node_modules\ajv\lib\dotjs\validate.js:230:37)
    at Object.generate_items [as code] (c:\temp\ajv-test\node_modules\ajv\lib\dotjs\items.js:122:20)
    at generate_validate (c:\temp\ajv-test\node_modules\ajv\lib\dotjs\validate.js:230:37)
    at Ajv.localCompile (c:\temp\ajv-test\node_modules\ajv\lib\compile\index.js:98:22)
    at Ajv.resolve (c:\temp\ajv-test\node_modules\ajv\lib\compile\resolve.js:53:19)

```

p.s. I already opened a bug but it was closed before the full issue was considered.
