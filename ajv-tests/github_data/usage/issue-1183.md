# [1183] How to verify if a value is of format and/or type double?

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Ajv version: 07

**Issue description**

I am trying to validate that a value returned by the JSON response body is of type and format double, using ajv validation, however, I'm not being able to do it.

I've tried typing the following:

    - "type" : "double",
    - "format": "double"

    - "type": "Double",
    - "format": "Double"

    - "type":"number"
    - "format":"double"

  All the above attempts were unsuccessful as they all come with an error message saying either:

     -  Error: unknown type "double" is used in schema
or 

     -  Error: unknown format "double" is used in schema