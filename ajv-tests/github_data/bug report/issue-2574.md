# [2574] $data reference for array type

It appears that the $data reference with relative json pointers only works for object types, not for array types. Would it be possible to extend its functionality so that it works for array types? If possible, please respond to james.smith@rcsb.org. 

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

I believe it's ajv/dist/2020

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
?
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
schema.json

{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "resolution",
  "description": "example resolution validation",
  "type": "object",

  "properties": {
    "_refine": {
      "oneOf": [
        { "$ref": "specification.json#/properties/_refine" },
        { "type": "array", "items":  { "$ref":  "specification.json#/properties/_refine" } }
      ]
    },
    "_reflns": {
      "oneOf": [
        { "$ref": "specification.json#/properties/_reflns" },
        { "type": "array", "items":  { "$ref":  "specification.json#/properties/_reflns" } }
      ]
    }
  },
  "required": ["_refine", "_reflns"]
}

specification.json

{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "resolution",
  "description": "example resolution validation",
  "type": "object",

  "properties": {
    "_refine": {
      "type": "object",
      "properties": {
        "ls_d_res_low": {
          "type": "number",
          "exclusiveMinimum": 0.0
        },
        "ls_d_res_high": {
          "type": "number",
          "minimum": { "$data": "2/_reflns/d_resolution_high" }
        }
      },
      "required": ["ls_d_res_low", "ls_d_res_high"]
    },
    "_reflns": {
      "type": "object",
      "properties": {
        "d_resolution_low": {
          "type": "number",
          "exclusiveMinimum": 0.0
        },
        "d_resolution_high": {
          "type": "number",
          "exclusiveMinimum": 0.0
        }
      },
      "required": ["d_resolution_low", "d_resolution_high"]
    }
  },
  "required": ["_refine", "_reflns"]
}

```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json

working.json (invalidates correctly)

{
  "_refine": {
    "ls_d_res_high": 0.87,
    "ls_d_res_low": 53.07
  },
  "_reflns": {
    "d_resolution_high": 1.87,
    "d_resolution_low": 60.14
  }
}

not_working.json (should invalidate)

{
    "_refine": [
        {
            "ls_d_res_high": 0.65,
            "ls_d_res_low": 40.0
        },
        {
            "ls_d_res_high": 0.9,
            "ls_d_res_low": 21.3
        }
    ],
    "_reflns": [
        {
            "d_resolution_high": 1.65,
            "d_resolution_low": 40
        },
        {
            "d_resolution_high": 1.9,
            "d_resolution_low": 21.3
        }
    ]
}

```

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
const Ajv = require("ajv/dist/2020");
const ajv = new Ajv({ $data:true } );
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const datafile = args[0];
const schemafile = args[1];
const specification = args[2];

const schemadata = JSON.parse(fs.readFileSync(specification, 'utf8'));
const filename = path.basename(specification);
ajv.addSchema(schemadata, filename);

const data = JSON.parse(fs.readFileSync(datafile, 'utf8'));
const schema = JSON.parse(fs.readFileSync(schemafile, 'utf8'));

const validate = ajv.compile(schema);
const valid = validate(data);

if (valid) {
    console.log("schema validated correctly");
} else {
    console.log("schema did not validate: ", validate.errors);
}
```

**Validation result, data AFTER validation, error messages**

```
(for not-working.json)

schema validated correctly
```

**What results did you expect?**
(for working.json)

schema did not validate:  [
  {
    instancePath: '/_refine/ls_d_res_high',
    schemaPath: 'specification.json#/properties/_refine/properties/ls_d_res_high/minimum',
    keyword: 'minimum',
    params: { comparison: '>=', limit: 1.87 },
    message: 'must be >= 1.87'
  },
**Are you going to resolve the issue?**
