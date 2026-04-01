# [1644] maximum call stack trace on new browsers

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/

For all size/type schemas. Recently Im having 'Maximum call stack trace' error. This is mostly on newest versions of Chrome/Firefox. It happens on linux/windows. There is cases when newest version does not throw this error. When error is thrown it points to a function mentioned in code section.

-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
All versions.


**Ajv options object**

var ajv = new Ajv({ useDefaults: true, removeAdditional: true } )

**JSON Schema**

all schemas small/large (was working no problems before)


var 06schema= require('ajv/lib/refs/json-schema-draft-06.json');
var ajv = new Ajv({ useDefaults: true, removeAdditional: true } )
avj.addMetaData(06schema)
addDefaultsAndRemoveAdditional = avj.compile(schema)
addDefaultsAndRemoveAdditional(object)


**What results did you expect?**
object to be autopopulated, as it was before.

**Are you going to resolve the issue?**
Chances are no, trying currently.
NOTE: error shows up mostly on new versions of chrome/firefox. Both in linux and windows environment. There are cases where newset version still has no error. 
