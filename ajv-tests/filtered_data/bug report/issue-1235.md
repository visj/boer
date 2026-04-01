# [1235] Pattern didn't work correctly

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.12.2


**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv#options -->

```javascript
{ allErrors: true, $data: true, jsonPointers: true }
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type":"object",
  "properties":{
    "firstName":{
      "type":"string",
      "minLength":1,
      "pattern":"^((?![`?!:;@#$%^&*,=+-.!/\\\"{}[]0-9]).)*$"
    },
    "lastName":{
      "type":"string",
      "minLength":1,
      "pattern":"^((?![`?!:;@#$%^&*,=+-.!/\\\"{}[]0-9]).)*$"
    }
  },
  "errorMessage":{
    "properties":{"firstName":"MUST_BE_VALID_FIRSTNAME","lastName":"MUST_BE_VALID_LASTNAME"}
  }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
    "firstName": "Hello #$??",
    "lastName": "World 123"
};

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

https://runkit.com/vmtran123/5ef1bce2eb51ca001c678eb9


**Validation result, data AFTER validation, error messages**

```
No error detected

```

**What results did you expect?**
This should return the error as I described in errorMessage (I already used ajv-errors). The point is the regex pattern which is supposed to prevent the string contains special characters (? : " !, etc...) didn't work at all or I just missed something but it actually did when I tried on regex101.com.

**Are you going to resolve the issue?**
Yes