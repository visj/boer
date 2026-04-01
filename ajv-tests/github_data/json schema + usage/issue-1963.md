# [1963] unevaluatedProperties: false doesn't work for array type sub-schema 

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.11.0

**Ajv options object**

default options

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type":"object",
  "unevaluatedProperties":false,
  "properties":{
    "list":{
      "type":"array",
      "items":{
        "type":"object",
        "properties":{
          "id":{
            "type":"string"
          }
        }
      }
    }
  }
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "list":[
    {
      "foo":1,
      "id":"abc"
    }
  ]
}
```

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

https://runkit.com/aleung/6260f73f3308ec0009307718

**Validation result, data AFTER validation, error messages**

Validation pass

**What results did you expect?**

`list[0].foo` is  unevaluated

**Are you going to resolve the issue?**

Maybe