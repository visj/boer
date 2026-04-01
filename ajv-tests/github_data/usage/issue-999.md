# [999] validator returns true on string

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
yes


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript

{}
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
var schema = {
  properties: {
    userId: {
      type: "integer",
      idExists: { table: "users" }
    },
    postId: {
      type: "integer",
      idExists: { table: "posts" }
    }
  }
};

```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```javascript
const validData = "";

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
const validData = "";
const Ajv = require("ajv");
var ajv = new Ajv();
console.log(ajv.validate(schema, validData)); //true

```

**What results did you expect?**
```
false

```