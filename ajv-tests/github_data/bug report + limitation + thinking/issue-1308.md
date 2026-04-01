# [1308] Different behaviour when using addKeyword and keywords in options

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

We are using `ajv`, for example, in the middleware, where we don't have access to the ajv instance. The preferred way to configure ajv is via options. There seem to be a difference between using `keywords` option and `ajv.addKeyword`. See the runnable examples below.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.12.6

**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv#options -->

```javascript
const ajv = new Ajv({
  allErrors: true,
  keywords: { typeof: typeofKeyword }
})

OR

const ajv = new Ajv({
  allErrors: true,
})
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "foo": {
      "type": "string",
      "minLength": 3,
      "maxLength": 255,
      "typeof": "number"
    }
  },
  "required": ["foo"]
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{ "foo": "aAa" }
```


**Your code**

I copied the source of `typeof` keyword from the ajv-keywords project and used it as an example.

The version with `addKeyword`

https://runkit.com/ttamminen/ajv-issue

The version with `keywords` option.

https://runkit.com/ttamminen/ajv-example

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->


**Validation result, data AFTER validation, error messages**

```
"meta-schema not available"
[Object {dataPath: ".foo", keyword: "typeof", message: "should pass \"typeof\" keyword validation", …}]
```

**What results did you expect?**

As the end results in both ways should be the same, I expected that there will be no "meta-schema not available" error.
