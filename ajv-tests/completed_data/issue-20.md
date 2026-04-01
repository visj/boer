# [20] AJV fails to compile schema with required properties that are not identifiers

The following schema fails to parse when using AJV but it does pass when pasted into http://jsonschemalint.com/draft4/

Is this a bug in AJV or am I doing something wrong with this schema that the linter isn't catching?  I'm very new to AJV and JSON Schema so would definitely not rule out user error here.  Thanks!

```
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "title": "Create User",
    "description": "Create User POST Request",
    "type": "object",
    "properties": {
        "data": {
            "description": "Top level data object",
            "type": "object",
            "properties":{
                "type": {"type":"string"},
                "attributes": {
                    "type":"object",
                    "properties": {
                        "username":{"type":"string"},
                        "email":{"type":"string"},
                        "full-name":{"type":"string"},
                        "password":{"type":"string"},
                        "is-admin":{"type":"boolean"},
                        "enabled":{"type":"boolean"}
                    },
                    "required":["username", "email", "full-name", "password", "is-admin", "enabled"],
                    "additionalProperties": false
                }
            },
            "required":["type", "attributes"],
            "additionalProperties": false
        }
    },
    "required": ["data"],
    "additionalProperties": false
}
```

The error I get is:

```
SyntaxError: Unexpected identifier
    at Ajv.compile (/Users/sarus/workspace/rest/node_modules/ajv/lib/compile/index.js:52:10)
    at _addSchema (/Users/sarus/workspace/rest/node_modules/ajv/lib/ajv.js:163:38)
    at Ajv.compile (/Users/sarus/workspace/rest/node_modules/ajv/lib/ajv.js:75:16)
    at Object.<anonymous> (/Users/sarus/workspace/rest/lib/routes.js:20:20)
    at Module._compile (module.js:460:26)
    at Object.Module._extensions..js (module.js:478:10)
    at Module.load (module.js:355:32)
    at Function.Module._load (module.js:310:12)
    at Module.require (module.js:365:17)
    at new require (module.js:384:17)
    at Object.module.exports.start (/Users/sarus/workspace/rest/lib/server.js:13:23)
    at Object.<anonymous> (/Users/sarus/workspace/rest/hamachi.js:1:87)
    at Module._compile (module.js:460:26)
    at Object.Module._extensions..js (module.js:478:10)
    at Module.load (module.js:355:32)
    at Function.Module._load (module.js:310:12)
Error compiling schema, function code:  validate = function (data, dataPath) { 'use strict'; validate.errors = null; var errors = 0;         if ((data && typeof data === "object" && !Array.isArray(data))) {    var missing0;  if (  ( data.data === undefined && (missing0 = '.data') ) ) {  validate.errors = [ { keyword: 'required', dataPath: (dataPath || '') + "" + missing0, message: 'property ' + missing0 + ' is required'  }]; return false;  } else {    var errs0 = errors;var valid1 = true; var propertiesSchema0 = validate.schema.properties || {}; for (var key0 in data) { var isAdditional0 = propertiesSchema0[key0] === undefined;  if (isAdditional0) {  valid1 = false;   validate.errors = [ { keyword: 'additionalProperties', dataPath: (dataPath || '') + "['" + key0 + "']", message: 'additional properties NOT allowed'  }]; return false;  break;  } }   if (valid1) {  var data1 = data.data;  if (data1 === undefined) { valid1 = true; } else {   var errs_1 = errors; if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {    var missing1;  if (  ( data1.type === undefined && (missing1 = '.type') )  ||  ( data1.attributes === undefined && (missing1 = '.attributes') ) ) {   var err =   { keyword: 'required', dataPath: (dataPath || '') + ".data" + missing1, message: 'property ' + missing1 + ' is required'  }; if (validate.errors === null) validate.errors = [err]; else validate.errors.push(err); errors++;  } else {    var errs1 = errors;var valid2 = true; var propertiesSchema1 = validate.schema.properties.data.properties || {}; for (var key1 in data1) { var isAdditional1 = propertiesSchema1[key1] === undefined;  if (isAdditional1) {  valid2 = false;    var err =   { keyword: 'additionalProperties', dataPath: (dataPath || '') + ".data['" + key1 + "']", message: 'additional properties NOT allowed'  }; if (validate.errors === null) validate.errors = [err]; else validate.errors.push(err); errors++;  break;  } }   if (valid2) {  if (data1.type === undefined) { valid2 = true; } else {   var errs_2 = errors; if (typeof data1.type !== "string") {    var err =   { keyword: 'type', dataPath: (dataPath || '') + ".data.type", message: 'should be string'  }; if (validate.errors === null) validate.errors = [err]; else validate.errors.push(err); errors++;  }   var valid2 = errors === errs_2; }  if (valid2) {  var data2 = data1.attributes;  if (data2 === undefined) { valid2 = true; } else {   var errs_2 = errors; if ((data2 && typeof data2 === "object" && !Array.isArray(data2))) {    var missing2;  if (  ( data2.username === undefined && (missing2 = '.username') )  ||  ( data2.email === undefined && (missing2 = '.email') )  ||  ( data2['full-name'] === undefined && (missing2 = '['full-name']') )  ||  ( data2.password === undefined && (missing2 = '.password') )  ||  ( data2['is-admin'] === undefined && (missing2 = '['is-admin']') )  ||  ( data2.enabled === undefined && (missing2 = '.enabled') ) ) {   var err =   { keyword: 'required', dataPath: (dataPath || '') + ".data.attributes" + missing2, message: 'property ' + missing2 + ' is required'  }; if (validate.errors === null) validate.errors = [err]; else validate.errors.push(err); errors++;  } else {    var errs2 = errors;var valid3 = true; var propertiesSchema2 = validate.schema.properties.data.properties.attributes.properties || {}; for (var key2 in data2) { var isAdditional2 = propertiesSchema2[key2] === undefined;  if (isAdditional2) {  valid3 = false;    var err =   { keyword: 'additionalProperties', dataPath: (dataPath || '') + ".data.attributes['" + key2 + "']", message: 'additional properties NOT allowed'  }; if (validate.errors === null) validate.errors = [err]; else validate.errors.push(err); errors++;  break;  } }   if (valid3) {  if (data2.username === undefined) { valid3 = true; } else {   var errs_3 = errors; if (typeof data2.username !== "string") {    var err =   { keyword: 'type', dataPath: (dataPath || '') + ".data.attributes.username", message: 'should be string'  }; if (validate.errors === null) validate.errors = [err]; else validate.errors.push(err); errors++;  }   var valid3 = errors === errs_3; }  if (valid3) {  if (data2.email === undefined) { valid3 = true; } else {   var errs_3 = errors; if (typeof data2.email !== "string") {    var err =   { keyword: 'type', dataPath: (dataPath || '') + ".data.attributes.email", message: 'should be string'  }; if (validate.errors === null) validate.errors = [err]; else validate.errors.push(err); errors++;  }   var valid3 = errors === errs_3; }  if (valid3) {  if (data2['full-name'] === undefined) { valid3 = true; } else {   var errs_3 = errors; if (typeof data2['full-name'] !== "string") {    var err =   { keyword: 'type', dataPath: (dataPath || '') + ".data.attributes['full-name']", message: 'should be string'  }; if (validate.errors === null) validate.errors = [err]; else validate.errors.push(err); errors++;  }   var valid3 = errors === errs_3; }  if (valid3) {  if (data2.password === undefined) { valid3 = true; } else {   var errs_3 = errors; if (typeof data2.password !== "string") {    var err =   { keyword: 'type', dataPath: (dataPath || '') + ".data.attributes.password", message: 'should be string'  }; if (validate.errors === null) validate.errors = [err]; else validate.errors.push(err); errors++;  }   var valid3 = errors === errs_3; }  if (valid3) {  if (data2['is-admin'] === undefined) { valid3 = true; } else {   var errs_3 = errors; if (typeof data2['is-admin'] !== "boolean") {    var err =   { keyword: 'type', dataPath: (dataPath || '') + ".data.attributes['is-admin']", message: 'should be boolean'  }; if (validate.errors === null) validate.errors = [err]; else validate.errors.push(err); errors++;  }   var valid3 = errors === errs_3; }  if (valid3) {  if (data2.enabled === undefined) { valid3 = true; } else {   var errs_3 = errors; if (typeof data2.enabled !== "boolean") {    var err =   { keyword: 'type', dataPath: (dataPath || '') + ".data.attributes.enabled", message: 'should be boolean'  }; if (validate.errors === null) validate.errors = [err]; else validate.errors.push(err); errors++;  }   var valid3 = errors === errs_3; }  }}}}}} }  }  else {    var err =   { keyword: 'type', dataPath: (dataPath || '') + ".data.attributes", message: 'should be object'  }; if (validate.errors === null) validate.errors = [err]; else validate.errors.push(err); errors++;  }    var valid2 = errors === errs_2; }  }} }  }  else {    var err =   { keyword: 'type', dataPath: (dataPath || '') + ".data", message: 'should be object'  }; if (validate.errors === null) validate.errors = [err]; else validate.errors.push(err); errors++;  }    var valid1 = errors === errs_1; }  } }  }  else {   validate.errors = [ { keyword: 'type', dataPath: (dataPath || '') + "", message: 'should be object'  }]; return false;  }    return errors === 0; }
```
