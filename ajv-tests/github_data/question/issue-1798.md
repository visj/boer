# [1798] Unattainable branches in validation function generated code

I'm using AJV 8.6.3 to generate a validation function for the following schema:

```json
{
  "type": "string",
  "pattern": "^\\d{7}$"
}
```

The generated code looks like this - I just added the `// unattainable` comments:

```js
"use strict";
module.exports = validate10;
module.exports.default = validate10;
const schema11 = {"type":"string","pattern":"^\\d{7}$"};
const pattern0 = new RegExp("^\\d{7}$", "u");

function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(typeof data === "string"){
if(!pattern0.test(data)){
const err0 = {instancePath,schemaPath:"#/pattern",keyword:"pattern",params:{pattern: "^\\d{7}$"},message:"must match pattern \""+"^\\d{7}$"+"\""};
if(vErrors === null){
vErrors = [err0];
}
else {
// unattainable
vErrors.push(err0);
}
errors++;
}
}
else {
const err1 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err1];
}
else {
// unattainable
vErrors.push(err1);
}
errors++;
}
validate10.errors = vErrors;
return errors === 0;
}
```

As you can see, it is impossible for the `if(vErrors === null)` else branches to be attained since `vErrors` is always initialized to `null`. It makes obtaining 100% code coverage on the validation function impossible and, thus, obtaining 100% code covegare on the schema impossible too.

Why are these branches on the generated code?
In which context can `vErrors` be different to `null`?
Why isn't `vErrors` an array to begin with, empty when no error occured, populated when errors occured?