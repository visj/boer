# [551] Uncaught EvalError: Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy directive: "script-src 'self' 'unsafe-inline'".

Hi, ajv stops work for me with such headers:
```
  devServer: {
    .....
    headers: {
     .....
     'Content-Security-Policy':
        "default-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; 
    },
    ......
}
```
npm ls:

``` 
.....
│ │ │   │ ├─┬ har-validator@4.2.1
.....
```

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
"ajv": "^5.2.2"

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
//default options

```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "id": "test",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    }
  }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
import React, { Component } from 'react'
import Ajv from 'ajv'

const schema = {
  id: 'test',
  type: 'object',
  properties: {
    name: {
      type: 'string'
    }
  }
}

export default class MessageForm extends Component {

  render() {
    const ajv = new Ajv()
    const validator = ajv.compile(schema)
    console.log('validator', validator)
    return (
        <div>AJV test</div>
    )
  }
}


```


**Validation result, data AFTER validation, error messages**

```
Error compiling schema, function code: var refVal1 = refVal[1]; var validate =  (function  (data, dataPath, parentData, parentDataProperty, rootData) { 'use strict';  var vErrors = null;  var errors = 0;            var errs_1 = errors;    var errs_2 = errors; if ((typeof data !== "number" || (data % 1) || data !== data)) {  validate.errors = [ { keyword: 'type' , dataPath: (dataPath || '') + "" , schemaPath: '#/definitions/nonNegativeInteger/type' , params: { type: 'integer' }  , message: 'should be integer'  } ]; return false;  }  if (typeof data === "number") {    if (  data < 0 || data !== data) {  validate.errors = [ { keyword: 'minimum' , dataPath: (dataPath || '') + "" , schemaPath: '#/definitions/nonNegativeInteger/minimum' , params: { comparison: '>=', limit: 0, exclusive: false }  , message: 'should be >= 0' } ]; return false;  }    }    var valid2 = errors === errs_2;     var valid1 = errors === errs_1;      validate.errors = vErrors;  return errors === 0;        }); return validate;
localCompile @ bundle.min.js:127783
resolve @ bundle.min.js:40919
resolveRef @ bundle.min.js:127823
generate_ref @ bundle.min.js:130089
generate_validate @ bundle.min.js:56487
generate_properties @ bundle.min.js:129709
generate_validate @ bundle.min.js:56563
localCompile @ bundle.min.js:127721
compile @ bundle.min.js:127690
_compile @ bundle.min.js:55657
getSchema @ bundle.min.js:55515
defaultMeta @ bundle.min.js:55499
validateSchema @ bundle.min.js:55473
_addSchema @ bundle.min.js:55616
compile @ bundle.min.js:55422
render @ bundle.min.js:187821
(anonymous) @ bundle.min.js:242958
measureLifeCyclePerf @ bundle.min.js:242237
_renderValidatedComponentWithoutOwnerOrContext @ bundle.min.js:242957
_renderValidatedComponent @ bundle.min.js:242984
performInitialMount @ bundle.min.js:242524
mountComponent @ bundle.min.js:242420
mountComponent @ bundle.min.js:30544
_updateRenderedComponent @ bundle.min.js:242927
_performComponentUpdate @ bundle.min.js:242886
updateComponent @ bundle.min.js:242807
performUpdateIfNecessary @ bundle.min.js:242723
performUpdateIfNecessary @ bundle.min.js:30655
runBatchedUpdates @ bundle.min.js:21830
perform @ bundle.min.js:38482
perform @ bundle.min.js:38482
perform @ bundle.min.js:21769
flushBatchedUpdates @ bundle.min.js:21852
closeAll @ bundle.min.js:38548
perform @ bundle.min.js:38495
batchedUpdates @ bundle.min.js:246164
batchedUpdates @ bundle.min.js:21777
dispatchEvent @ bundle.min.js:246476

Uncaught EvalError: Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy directive: "script-src 'self' 'unsafe-inline'".


    at new Function (<anonymous>)
    at Ajv.localCompile (bundle.min.js:127752)
    at Ajv.resolve (bundle.min.js:40919)
    at Object.resolveRef (bundle.min.js:127823)
    at Object.generate_ref [as code] (bundle.min.js:130089)
    at Object.generate_validate [as validate] (bundle.min.js:56487)
    at Object.generate_properties [as code] (bundle.min.js:129709)
    at generate_validate (bundle.min.js:56563)
    at localCompile (bundle.min.js:127721)
    at Ajv.compile (bundle.min.js:127690)
localCompile @ bundle.min.js:127752
resolve @ bundle.min.js:40919
resolveRef @ bundle.min.js:127823
generate_ref @ bundle.min.js:130089
generate_validate @ bundle.min.js:56487
generate_properties @ bundle.min.js:129709
generate_validate @ bundle.min.js:56563
localCompile @ bundle.min.js:127721
compile @ bundle.min.js:127690
_compile @ bundle.min.js:55657
getSchema @ bundle.min.js:55515
defaultMeta @ bundle.min.js:55499
validateSchema @ bundle.min.js:55473
_addSchema @ bundle.min.js:55616
compile @ bundle.min.js:55422
render @ bundle.min.js:187821
(anonymous) @ bundle.min.js:242958
measureLifeCyclePerf @ bundle.min.js:242237
_renderValidatedComponentWithoutOwnerOrContext @ bundle.min.js:242957
_renderValidatedComponent @ bundle.min.js:242984
performInitialMount @ bundle.min.js:242524
mountComponent @ bundle.min.js:242420
mountComponent @ bundle.min.js:30544
_updateRenderedComponent @ bundle.min.js:242927
_performComponentUpdate @ bundle.min.js:242886
updateComponent @ bundle.min.js:242807
performUpdateIfNecessary @ bundle.min.js:242723
performUpdateIfNecessary @ bundle.min.js:30655
runBatchedUpdates @ bundle.min.js:21830
perform @ bundle.min.js:38482
perform @ bundle.min.js:38482
perform @ bundle.min.js:21769
flushBatchedUpdates @ bundle.min.js:21852
closeAll @ bundle.min.js:38548
perform @ bundle.min.js:38495
batchedUpdates @ bundle.min.js:246164
batchedUpdates @ bundle.min.js:21777
dispatchEvent @ bundle.min.js:246476

```

**What results did you expect?**


**Are you going to resolve the issue?**
