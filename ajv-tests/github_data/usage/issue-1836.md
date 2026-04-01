# [1836] Integer type keywords


**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Migrate from v6 to v8

**Repro**

```javascript
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, useDefaults: true });

ajv.compile({ type: 'integer', minumum: 10 }) // throws unknown keyword
ajv.compile({type: "number", maximum: 5}) // fine
ajv.compile({type: "number", minimum: 5}) // fine
```

**What results did you expect?**
Like it was before, integer type to have minimum keyword.
I did not found the difference in schema drafts from v6 to v8. Maybe i am looking not in right place?

**Are you going to resolve the issue?**
If it is a bug, i can help