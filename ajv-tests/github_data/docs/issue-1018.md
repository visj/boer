# [1018] Maybe make the first added meta default (however it is added) (README draft-04 instructions cause warnings)

When following the instructions for validating against draft-04 multiple warnings are thrown in the console every time. Might just be a documentation issue as putting `meta: false` or using `schemaId: 'auto'` in the configuration options prevents these warnings.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.10.0 
Yes, this happens on latest


**Your code**

```javascript
const Ajv = require('ajv');
const ajv = new Ajv({schemaId: 'id'});
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
```


**Warning messages**
```
schema $id ignored http://json-schema.org/draft-07/schema#
schema $id ignored http://json-schema.org/draft-07/schema#
schema $id ignored http://json-schema.org/draft-07/schema#
```

**What results did you expect?**
No warnings when following the instructions for using draft-04

**Are you going to resolve the issue?**
No