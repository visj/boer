# [2578] undefined values in schemas are not ignored but throws TypeError

I was struggling for hours with an error only happening in my deployed function, but not locally.
Turns out, since I generate the schema programmatically, I had some optional property that was undefined in the schema. This causes AJV to throw `TypeError: Cannot convert undefined or null to object`.

I logged my schema and data, copy pasted it in a local test program and spent HOURS not understanding what was happening. Why was it working locally but not when running in my deployed function?
Turns out the schema had an `undefined` in it, which was of course trimmed away silently when logging to cloud watch, hence not ending up in my local test program.

is there any reason Ajv could not ignore undefineds? I assume it does something like iterate properties using `Object.keys` or `for const k in obj`, and just checking `if obj[k] === undefined {<skip this>}` seems harmless?

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

ajv 8.17.1 - latest

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{strictSchema: false}

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  type: "object", 
  properties: {
    foo: {type: "string"},
    bar: undefined
  }
}

```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{foo:  "FOO"}

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

```javascript
new Ajv({strictSchema: false}).validate(schema, data);
```

**Validation result, data AFTER validation, error messages**

```
TypeError: Cannot convert undefined or null to object
```

**What results did you expect?**

I expected `undefined` values in schemas to be ignored silently and the object to match the schema.

**Are you going to resolve the issue?**

I'm happy to attempt at a PR
