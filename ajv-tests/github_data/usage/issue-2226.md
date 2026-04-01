# [2226] Property name with `/` converted into `~1`

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

Why property names with `/` gets replaced with `~1`? 
`user/username` becomees `user~1username` for example.

Where does it happen and is it possible to disable it?

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  type: "object",
  properties: {
    "user/username": {type: "integer"},
    "user/password": {type: "string", "minLength": 6},
  },
  additionalProperties: false,
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "user/username": "user1",
  "user/password": "abc",
}
```

**Your code**
Codesandbox link
https://codesandbox.io/s/tender-flower-yybhqt?file=/src/index.js
<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript

```

**Validation result, data AFTER validation, error messages**

```
instancePath: "/user~1username"
schemaPath: "#/properties/user~1username/type"
keyword: "type"
params: Object
type: "integer"
message: "must be integer"
```

**What results did you expect?**
Retain the `/`,
`instancePath` should be `/user/username`
`schemaPath` should be `#/properties/user/username/type`

**Are you going to resolve the issue?**
