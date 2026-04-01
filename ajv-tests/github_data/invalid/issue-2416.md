# [2416] Error using multipleOf with decimals

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.12.0
**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const Ajv = require("ajv");
const ajv = new Ajv();
const schema = {
   type: "number",
   multipleOf: 0.01
 };
const validate = ajv.compile(schema);
validate(8.69);;
// results: false
```
**What results did you expect?**
true
**Are you going to resolve the issue?**
No.