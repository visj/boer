# [848] Property "allowedValue" does not exist on type "ErrorParameters"

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
the latest version

**Ajv options object**
N/A since this is a types issue

**JSON Schema**
N/A since this is a types issue

**Sample data**
N/A since this is a types issue

**Your code**

```javascript
 private getExpectedConstant(error: Ajv.ErrorObject) {
    return error.params.allowedValue;
 }
```
**Error**
"allowedValue" does not exist on type "ErrorParameters"

**What results did you expect?**
There should be a ConstParams type that is included in the exported ErrorParameters type.
```
interface ConstParams {
    allowedValue: any;
 }
```
The readme explicitly states this exists and I see it in the raw results but I cannot compile my typescript that tries to access it.

```
const - property allowedValue pointing to the value (the schema of the keyword).
```

**Are you going to resolve the issue?**
If I have time I can submit a pull request