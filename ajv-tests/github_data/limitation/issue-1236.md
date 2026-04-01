# [1236] Using ajv with hyper-schema 

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Ajv 6.12.2 (currently latest)


**Ajv options object**
*default ones*


**JSON Schema**
<!-- Please make it as small as possible to reproduce the issue -->
`schemas/draft07/hyper-schema.json` (fetch from http://json-schema.org/draft-07/hyper-schema#)
```json
{
    "$schema": "http://json-schema.org/draft-07/hyper-schema#",
    "$id": "http://json-schema.org/draft-07/hyper-schema#",
    "title": "JSON Hyper-Schema",
    "definitions": {
        "schemaArray": {
            "allOf": [
                { "$ref": "http://json-schema.org/draft-07/schema#/definitions/schemaArray" },
                {
                    "items": { "$ref": "#" }
                }
            ]
        }
    },
    "allOf": [ { "$ref": "http://json-schema.org/draft-07/schema#" } ],
    "properties": {
        "additionalItems": { "$ref": "#" },
        "additionalProperties": { "$ref": "#"},
        "dependencies": {
            "additionalProperties": {
                "anyOf": [
                    { "$ref": "#" },
                    { "type": "array" }
                ]
            }
        },
        "items": {
            "anyOf": [
                { "$ref": "#" },
                { "$ref": "#/definitions/schemaArray" }
            ]
        },
        "definitions": {
            "additionalProperties": { "$ref": "#" }
        },
        "patternProperties": {
            "additionalProperties": { "$ref": "#" }
        },
        "properties": {
            "additionalProperties": { "$ref": "#" }
        },
        "if": { "$ref": "#" },
        "then": { "$ref": "#" },
        "else": { "$ref": "#" },
        "allOf": { "$ref": "#/definitions/schemaArray" },
        "anyOf": { "$ref": "#/definitions/schemaArray" },
        "oneOf": { "$ref": "#/definitions/schemaArray" },
        "not": { "$ref": "#" },
        "contains": { "$ref": "#" },
        "propertyNames": { "$ref": "#" },
        "base": {
            "type": "string",
            "format": "uri-template"
        },
        "links": {
            "type": "array",
            "items": {
                "$ref": "http://json-schema.org/draft-07/links#"
            }
        }
    },
    "links": [
        {
            "rel": "self",
            "href": "{+%24id}"
        }
    ]
}
```
`schemas/draft07/links.json` (fetch from http://json-schema.org/draft-07/links#)
```json
{
    "$schema": "http://json-schema.org/draft-07/hyper-schema#",
    "$id": "http://json-schema.org/draft-07/links#",
    "title": "Link Description Object",
    "allOf": [
        { "required": [ "rel", "href" ] },
        { "$ref": "#/definitions/noRequiredFields" }
    ],
    "definitions": {
        "noRequiredFields": {
            "type": "object",
            "properties": {
                "anchor": {
                    "type": "string",
                    "format": "uri-template"
                },
                "anchorPointer": {
                    "type": "string",
                    "anyOf": [
                        { "format": "json-pointer" },
                        { "format": "relative-json-pointer" }
                    ]
                },
                "rel": {
                    "type": "string"
                },
                "href": {
                    "type": "string",
                    "format": "uri-template"
                },
                "hrefSchema": {
                    "$ref": "http://json-schema.org/draft-07/hyper-schema#"
                },
                "templatePointers": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "string",
                        "anyOf": [
                            { "format": "json-pointer" },
                            { "format": "relative-json-pointer" }
                        ]
                    }
                },
                "templateRequired": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "uniqueItems": true
                },
                "title": {
                    "type": "string"
                },
                "description": {
                    "type": "string"
                },
                "targetSchema": {
                    "$ref": "http://json-schema.org/draft-07/hyper-schema#"
                },
                "targetMediaType": {
                    "type": "string"
                },
                "targetHints": { },
                "headerSchema": {
                    "$ref": "http://json-schema.org/draft-07/hyper-schema#"
                },
                "submissionMediaType": {
                    "type": "string",
                    "default": "application/json"
                },
                "submissionSchema": {
                    "$ref": "http://json-schema.org/draft-07/hyper-schema#"
                },
                "$comment": {
                    "type": "string"
                }
            }
        }
    }
}
```

**Your code**
```javascript
const Ajv = require('ajv');
// Ajv does not allow to import schema by uri, so I download them and put thems in thoses files
// I've download them directly from http://json-schema.org http://json-schema.org/draft-07/hyper-schema# and http://json-schema.org/draft-07/links#
const hyperSchema = require('./schemas/draft07/hyper-schema.json');
const linkSchema = require('./schemas/draft07/links.json');
var ajv = new Ajv();
ajv.addSchema([hyperSchema, linkSchema]); // unsure if I should use addSchema or addMetaSchema, so I tried both without success
```


**Validation result, data AFTER validation, error messages**

```
<path_to_project>\node_modules\ajv\lib\ajv.js:352
    throw e;
    ^
[MissingRefError: can't resolve reference http://json-schema.org/draft-07/links# from id http://json-schema.org/draft-07/hyper-schema#] {        
  message: "can't resolve reference http://json-schema.org/draft-07/links# from id http://json-schema.org/draft-07/hyper-schema#",     
  missingRef: 'http://json-schema.org/draft-07/links',
  missingSchema: 'http://json-schema.org/draft-07/links'
}
```

Or the following if I change the last line to `ajv.addSchema([linkSchema, hyperSchema]);`
```
<path_to_project>\node_modules\ajv\lib\ajv.js:93
    if (!v) throw new Error('no schema with key or ref "' + schemaKeyRef + '"');
            ^

Error: no schema with key or ref "http://json-schema.org/draft-07/hyper-schema#"
    at Ajv.validate (<path_to_project>\node_modules\ajv\lib\ajv.js:93:19)
    at Ajv.validateSchema (<path_to_project>\node_modules\ajv\lib\ajv.js:174:20)
    at Ajv._addSchema (<path_to_project>\node_modules\ajv\lib\ajv.js:308:10)
    at Ajv.addSchema (<path_to_project>\node_modules\ajv\lib\ajv.js:137:29)
    at Ajv.addSchema (<path_to_project>\node_modules\ajv\lib\ajv.js:129:46)
    at Object.<anonymous> (<path_to_project>\index.js:6:5)
    at Module._compile (internal/modules/cjs/loader.js:1158:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1178:10)
    at Module.load (internal/modules/cjs/loader.js:1002:32)
    at Function.Module._load (internal/modules/cjs/loader.js:901:14)
```

I've also tried to skip schema validation using `ajv.addSchema([hyperSchema, linkSchema], undefined, true)` but it then fails when importing my schema with the following error (validateSchema method failed when handling the hyper-schema):
```
<path_to_project>\node_modules\ajv\lib\ajv.js:179
    else throw new Error(message);
         ^

Error: schema is invalid: data.properties['$ref'] should be object,boolean
    at Ajv.validateSchema (<path_to_project>\node_modules\ajv\lib\ajv.js:179:16)
    at Ajv._addSchema (<path_to_project>\node_modules\ajv\lib\ajv.js:308:10)
    at Ajv.addSchema (<path_to_project>\node_modules\ajv\lib\ajv.js:137:29)
    at Ajv.addSchema (<path_to_project>\node_modules\ajv\lib\ajv.js:129:46)
    at main (<path_to_project>\index.js:33:5)
    at Object.<anonymous> (<path_to_project>\index.js:35:1)
    at Module._compile (internal/modules/cjs/loader.js:1158:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1178:10)
    at Module.load (internal/modules/cjs/loader.js:1002:32)
    at Function.Module._load (internal/modules/cjs/loader.js:901:14)
```
I'm not sure that's really a bug, it's certainlly just a misconfigured option on my side.. 
Is is related to a wrong usage of `addSchema` with multiple files, or is it related to hyper-schema handling with `ajv` ?
Thank you in advance for your help