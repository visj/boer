# [922] Not getting error if we not passed required key in schema

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.6.2

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript


```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
var ajv = new Ajv({ useDefaults: true });
var schema = {
  "type": "object",
  "properties": {
    "bar": { "type": "string" }
  },
  "required": [ "foo", "bar" ]
};

var data = { "foo": 1, "bar": "baz" };

var validate = ajv.compile(schema);

console.log(validate(data)); 
console.log(data); 

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


```


**Validation result, data AFTER validation, error messages**

```


```

**What results did you expect?**

If we not passing required key "foo" in the data then i think it should give error for missing "foo" key in the s. But in this case not getting any error. 

**Are you going to resolve the issue?**
