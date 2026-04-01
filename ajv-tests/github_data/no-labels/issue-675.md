# [675] IE 11 Failure to compile schema during makeValidate initialization

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Began with 5.3.0, then updated to the latest version, 6.0.1. The issue persists.

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{
  allErrors: true,
  jsonPointers: true,
  schemas: [schemas.token.post, schemas.definitions],
}
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

schemas/token/post.json
```json
{
  "$id": "token.post.json",
  "$async": true,
  "type": "object",
  "properties": {
    "identifier": {
      "type": "string"
    },
    "password": {
      "type": "string"
    },
    "asCookie": {
      "type": "boolean"
    },
    "isPersistent": {
      "type": "boolean"
    },
    "expiresIn": {
      "type": "number",
      "max": 720
    },
    "registrationToken": {
      "type": "string"
    }
  },
  "additionalProperties": false,
  "oneOf": [
    {"required": ["identifier", "password"]},
    {"required": ["registrationToken"]}
  ],
  "errorMessage": {
    "oneOf": "An identifier and password are required or a registration token is required."
  }
}
```

schemas/definitions.json
```json
{
  "$id": "definitions.json",
  "$async": true,
  "definitions": {
    "username": {
      "type": "string",
      "minLength": 2,
      "maxLength": 80,
      "errorMessage": {
        "minLength": "Your username must be at least 2 characters long.",
        "maxLength": "You username must be at most 80 characters long."
      }
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "password": {
      "type": "string",
      "minLength": 8,
      "maxLength": 100
    }
  }
}
```

~~**Sample data**~~
~~**Your code**~~
~~**Validation result, data AFTER validation, error messages**~~
~~**What results did you expect?**~~

This does not appear to be a validation issue. Instead, it might be with how IE is evaluating the `sourceCode` generated in _`ajv/lib/compile/index.js`_

### Description

In the desktop versions of Chrome, Firefox, Safari, and Edge, my app loads just fine. In Internet Explorer, however, the following errors are reported in the console:

```Error compiling schema, function code: var customRule0 = ...```
```SCRIPT1004: Expected ':'```
```index.js(148, 1)```

> NOTE: For ajv@5.3.0, `Expected '('` rather than `;` is reported.

I placed a breakpoint at line 148, reloaded, and copied the value stored in `sourceCode`:

![ajvdebugcapture](https://user-images.githubusercontent.com/4138177/34923097-93a0b9c8-f966-11e7-823b-d1b9fa13c6a6.PNG)

That value is:
```javascript
"var customRule0 = customRules[0]; var validate = async function(data, dataPath, parentData, parentDataProperty, rootData) { 'use strict';  var vErrors = null;  var errors = 0;        if ((data && typeof data === \"object\" && !Array.isArray(data))) {   var errs__0 = errors;var valid1 = true; for (var key0 in data) {  var isAdditional0 = !(false  || validate.schema.properties[key0]  ); if (isAdditional0) {  valid1 = false;  var err =  { keyword: 'additionalProperties' , dataPath: (dataPath || '') + \"\" , schemaPath: '#/additionalProperties' , params: { additionalProperty: '' + key0 + '' }  , message: 'should NOT have additional properties'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  }   if (data.identifier !== undefined  ) {   var errs_1 = errors; if (typeof data.identifier !== \"string\") {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '/identifier' , schemaPath: '#/properties/identifier/type' , params: { type: 'string' }  , message: 'should be string'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid1 = errors === errs_1; }  if (data.password !== undefined  ) {   var errs_1 = errors; if (typeof data.password !== \"string\") {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '/password' , schemaPath: '#/properties/password/type' , params: { type: 'string' }  , message: 'should be string'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid1 = errors === errs_1; }  if (data.asCookie !== undefined  ) {   var errs_1 = errors; if (typeof data.asCookie !== \"boolean\") {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '/asCookie' , schemaPath: '#/properties/asCookie/type' , params: { type: 'boolean' }  , message: 'should be boolean'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid1 = errors === errs_1; }  if (data.isPersistent !== undefined  ) {   var errs_1 = errors; if (typeof data.isPersistent !== \"boolean\") {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '/isPersistent' , schemaPath: '#/properties/isPersistent/type' , params: { type: 'boolean' }  , message: 'should be boolean'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid1 = errors === errs_1; }  if (data.expiresIn !== undefined  ) {   var errs_1 = errors; if (typeof data.expiresIn !== \"number\") {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '/expiresIn' , schemaPath: '#/properties/expiresIn/type' , params: { type: 'number' }  , message: 'should be number'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid1 = errors === errs_1; }  if (data.registrationToken !== undefined  ) {   var errs_1 = errors; if (typeof data.registrationToken !== \"string\") {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '/registrationToken' , schemaPath: '#/properties/registrationToken/type' , params: { type: 'string' }  , message: 'should be string'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid1 = errors === errs_1; }   }  else {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + \"\" , schemaPath: '#/type' , params: { type: 'object' }  , message: 'should be object'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }   var errs__0 = errors , prevValid0 = false , valid0 = false , passingSchemas0 = null;    var errs_1 = errors; if ((data && typeof data === \"object\" && !Array.isArray(data))) {    if ( data.identifier === undefined ) {  var err =    { keyword: 'required' , dataPath: (dataPath || '') + \"\" , schemaPath: '#/oneOf/0/required' , params: { missingProperty: 'identifier' }  , message: 'should have required property \\'identifier\\''  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; }  if ( data.password === undefined ) {  var err =    { keyword: 'required' , dataPath: (dataPath || '') + \"\" , schemaPath: '#/oneOf/0/required' , params: { missingProperty: 'password' }  , message: 'should have required property \\'password\\''  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; }   }  var valid1 = errors === errs_1;  if (valid1) { valid0 = prevValid0 = true; passingSchemas0 = 0; }   var errs_1 = errors; if ((data && typeof data === \"object\" && !Array.isArray(data))) {    if ( data.registrationToken === undefined ) {  var err =    { keyword: 'required' , dataPath: (dataPath || '') + \"\" , schemaPath: '#/oneOf/1/required' , params: { missingProperty: 'registrationToken' }  , message: 'should have required property \\'registrationToken\\''  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; }   }  var valid1 = errors === errs_1;  if (valid1 && prevValid0) { valid0 = false; passingSchemas0 = [passingSchemas0, 1]; } else {  if (valid1) { valid0 = prevValid0 = true; passingSchemas0 = 1; }}if (!valid0) {   var err =    { keyword: 'oneOf' , dataPath: (dataPath || '') + \"\" , schemaPath: '#/oneOf' , params: { passingSchemas: passingSchemas0 }  , message: 'should match exactly one schema in oneOf'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } else {  errors = errs__0; if (vErrors !== null) { if (errs__0) vErrors.length = errs__0; else vErrors = null; } }    var errs__0 = errors;var valid0;   if (errors > 0) { var _em_dataPath0 = (dataPath || '') + \"\"; var _em_i0, _em_err0, _em_errors0;  _em_i0 = 0; _em_errors0 = {\"oneOf\":[]};  var _em_templates0 = {  }; while (_em_i0 < errors) { _em_err0 = vErrors[_em_i0]; if (  _em_err0.keyword != 'errorMessage'  && _em_err0.keyword in _em_errors0 && _em_err0.dataPath == _em_dataPath0 && _em_err0.schemaPath.indexOf('#') == 0 && /^\\/[^\\/]*$/.test(_em_err0.schemaPath.slice(1))) { _em_errors0[_em_err0.keyword].push(_em_err0);   vErrors.splice(_em_i0, 1); errors--;  } else { _em_i0++; } }  for (var _em_key0 in _em_errors0) { if (_em_errors0[_em_key0].length) {  var _em_message0 =   _em_key0 in _em_templates0 ? _em_templates0[_em_key0] () : validate.schema.errorMessage[_em_key0]; var _em_paramsErrors0 = _em_errors0[_em_key0];   var err = { keyword: 'errorMessage' , dataPath: _em_dataPath0 , schemaPath: '#' + '/errorMessage' , params: { errors: _em_paramsErrors0 } , message: _em_message0  };  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  } }  }   if (errors === 0) return data;            else throw new ValidationError(vErrors);  }; return validate;"
```
Sure enough, attempting to `eval` this value or construct a `Function` with it results in the same `Expected ';'` error. I pasted the results of `console.log`ing the value in http://jshint.com/ but no **Missing semicolon** error was reported.

**Are you going to resolve the issue?**
I would love to, if I knew how. It might have to do with how escapes are interpreted by IE.
