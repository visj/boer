# [1303] required is only verified for first item in array, instead of al items

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
LATEST (Oct 19, 2020).cat 


**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv#options -->

```javascript


```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->
```json

{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",   "properties": {
    "array": { "type": "array", "items": [ { "type": "object", "properties": { "a": {"type": "string" } }, "required": [ "a" ] } ] }
  }
}

```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
  "array": [ {  "a": "abc" }, {  "x": "abc" } ]
}

```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript


```


**Validation result, data AFTER validation, error messages**

```


```

**What results did you expect?**

I EXPECTED THIS DATA TO FAIL VALIDATION, SINCE THE SECOND OBJECT DOESN"T HAVE THE REQUIRED FIELD.

**Are you going to resolve the issue?**

NO, SORRY... 