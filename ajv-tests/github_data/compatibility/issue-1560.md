# [1560] Unexpected warning when using ajv-merge-patch

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

ajv@7.2.4

(ajv@8.1.0 in the runkit)

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{
  allowMatchingProperties: true,
  code: {
    lines: true,
  },
}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

N/A

**Sample data**

N/A

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

runkit:

https://runkit.com/craigphicks-public/ajv-issue-1560

```javascript
const Ajv2019 = require('ajv/dist/2019');
const AjvMergePatch=require("ajv-merge-patch")
const draft7MetaSchema = require('ajv/dist/refs/json-schema-draft-07.json');
const ajv = new Ajv2019({
  allowMatchingProperties: true,
  code: {
    lines: true,
  },
}); 
ajv.addMetaSchema(draft7MetaSchema);
AjvMergePatch(ajv);
```

**Validation result, data AFTER validation, error messages**

The program doesn't execute validation.
The program emitted unexpected warning output after applying the merge patch. 
```
"these parameters are deprecated, see docs for addKeyword"
```

**What results did you expect?**

I didn't expect a warning.  
However, since there was a warning, I I expected a listing of which parameters are depracated.

**Are you going to resolve the issue?**

Can I resolve this problem by a change in usage?