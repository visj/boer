# [541] Issue with Firefox CSP

Hey there,
I'm using Ajv 5.2.2 for my Firefox add-on (webextension). (using Firefox Developer Edition 55.0b5 (32-bit))
When running the add-on and trying to validate a schema, I get the following error:

> Error: call to Function() blocked by CSP
Stack trace:
w@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/external-scripts/ajv.min.js:2:13698

(for full error see below)
It seems CSP of firefox is blocking the call of ajv to Function(), because my karma tests with the same input run without errors.  ([More information on Firefox CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src#unsafe-eval-expressions))
Could you fix this issue or give me a hint for a workaround?
I appreciate your help!


Precise error description below:

> Error compiling schema, function code: var refVal1 = refVal[1]; var validate =  (function  (data, dataPath, parentData, parentDataProperty, rootData) { 'use strict';  var vErrors = null;  var errors = 0;            var errs_1 = errors;    var errs_2 = errors; if ((typeof data !== "number" || (data % 1) || data !== data)) {  validate.errors = [ { keyword: 'type' , dataPath: (dataPath || '') + "" , schemaPath: '#/definitions/nonNegativeInteger/type' , params: { type: 'integer' }  , message: 'should be integer'  } ]; return false;  }  if (typeof data === "number") {    if (  data < 0 || data !== data) {  validate.errors = [ { keyword: 'minimum' , dataPath: (dataPath || '') + "" , schemaPath: '#/definitions/nonNegativeInteger/minimum' , params: { comparison: '>=', limit: 0, exclusive: false }  , message: 'should be >= 0' } ]; return false;  }    }    var valid2 = errors === errs_2;     var valid1 = errors === errs_1;      validate.errors = vErrors;  return errors === 0;        }); return validate;

> Error: call to Function() blocked by CSP
Stack trace:
w@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/external-scripts/ajv.min.js:2:13698
a@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/external-scripts/ajv.min.js:2:17551
j@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/external-scripts/ajv.min.js:2:14268
[32]</r.exports@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/external-scripts/ajv.min.js:2:70618
[35]</r.exports@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/external-scripts/ajv.min.js:2:85759
[30]</r.exports@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/external-scripts/ajv.min.js:2:63065
[35]</r.exports@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/external-scripts/ajv.min.js:2:86904
w@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/external-scripts/ajv.min.js:2:13379
a@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/external-scripts/ajv.min.js:2:15794
v@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/external-scripts/ajv.min.js:2:116907
u@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/external-scripts/ajv.min.js:2:115082
u@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/external-scripts/ajv.min.js:2:115119
s@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/external-scripts/ajv.min.js:2:113732
l@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/external-scripts/ajv.min.js:2:114701
m@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/external-scripts/ajv.min.js:2:116410
o@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/external-scripts/ajv.min.js:2:113972
_parseBlueprint@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/background-scripts/player.js:45:26
Player@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/background-scripts/player.js:16:26
createPlayer@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/background-scripts/passwordChanger.js:81:12
openPasswordChangeDialog@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/html-pages/accountlist/accountlistHandler.js:247:22
addAccountSection/$createPathBtn<@moz-extension://cf9a0837-5f7a-4cbd-be25-68989a49bd6a/html-pages/accountlist/accountlistHandler.js:122:17
dispatch@https://code.jquery.com/jquery-3.2.1.min.js:3:10264
add/q.handle@https://code.jquery.com/jquery-3.2.1.min.js:3:8326

