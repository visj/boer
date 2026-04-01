# [2399] JTD schema parser errors on empty properties field

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
latest version

**Ajv options object**
no options

<!-- See https://ajv.js.org/options.html -->

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{ "properties": {} }
```

**Validation result, data AFTER validation, error messages**

```
TypeError: Reduce of empty array with no initial value
```

**Code**

```javascript
  const ajv = new Ajv();
ajv.compileParser({ properties: {} });
```

**What results did you expect?**
A compiled schema that passes nothing or everything. I think more graceful handling would be nice
