# [2286] If $id contains spaces, getSchema cannot get properties

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Version: 8.12.0 (Current version)

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
new Ajv({ allErrors: true, strict: false, coerceTypes: true})
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
// Working
{
  "$id": "ItemSchema",
  "properties": {
      "test": {
         // Schema
      }
   }
}
// Not Working
{
  "$id": "Item Schema",
  "properties": {
      "test": {
         // Schema
      }
   }
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
// Data is not relevant, works correctly if $id doesn't contain spaces
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
let scope = "Item Schema#/properties/test"
const ajv = new Ajv({ allErrors: true, strict: false, coerceTypes: true })
ajv.addSchema(schema)
const validate = ajv.getSchema(scope)

if (!validate) {
   throw Error()
}
```
Runkit: https://runkit.com/aliyss/ajv-issue

**Validation result, data AFTER validation, error messages**

```
Error
```

**What results did you expect?**

Same result as when using ItemSchema as the $id

**Are you going to resolve the issue?**
I can currently work around it by just renaming, but thought it might be of interest.
It is also completely possible that this is intended and that $id shouldn't even contain spaces.