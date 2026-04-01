# [618] Configuration for console logging

**What version of Ajv you are you using?**
5.1.3

**What problem do you want to solve?**
Ajv uses console.warn to report some warnings to the console.
I had several issues with some consumers of my package (which uses Ajv) that on there site they have a customized version of the console object and they don't interested with the Ajv warnings, in some cases the customized version did not implemented the `warn` function what leads to an Error.

This force these kind of sites to change the implementation of the console object in order to use packages that are depended in Ajv - which is not so easy when it comes to a large scale sites of big firms.
 
**What do you think is the correct solution to problem?**
I think that there should be a new option: `consoleLog`, default true, that when set to false there will be no reports to the console object whatsoever. 

**Will you be able to implement it?**
Yes

