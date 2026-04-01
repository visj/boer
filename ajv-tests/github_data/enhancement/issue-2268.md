# [2268] Ability to Codegen arrays

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
v8.12.0

**What problem do you want to solve?**
Currently there is a `CodeGen.object` method for generating an object literal in the code, but no such thing exists for arrays. I'm attempting to implement a custom keyword code method, which grabs another piece of data off `cxt.parentSchema` and inject it into the code so that it is passed into a call to `rootData.$callbacks.myCustomKeyword`

if I interpolate `${myStringArray}` into a _ tagged template, it will be .toString'd first e.g. `[]` becomes an empty string in the generated code, `['x', 'y']` becomes `'x,y'`, etc.

**What do you think is the correct solution to problem?**
Create a `Codegen.array` method

**Will you be able to implement it?**
I could try to follow the existing object implementation, just wanted to first make sure it doesn't already exist some other way