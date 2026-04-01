# [1777] using standaloneCode() with ajv instance

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.6.3

**Ajv options object**

```javascript
{ code: { source: true } }
```

**JSON Schema**
Taken from https://json-schema.org/learn/miscellaneous-examples.html.
```json
{
  "$id": "https://example.com/person.schema.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Person",
  "type": "object",
  "properties": {
    "firstName": {
      "type": "string",
      "description": "The person's first name."
    },
    "lastName": {
      "type": "string",
      "description": "The person's last name."
    },
    "age": {
      "description": "Age in years which must be equal to or greater than zero.",
      "type": "integer",
      "minimum": 0
    }
  }
}
```

**Your code**
https://runkit.com/proteriax/615a679fdea26e0008143877

**Result**

```
"use strict;"
```

**What results did you expect?**
Not an empty JavaScript file.

**Are you going to resolve the issue?**
