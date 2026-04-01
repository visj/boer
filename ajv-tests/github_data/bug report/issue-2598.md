# [2598] Issue: `require` imports in generated code when `esm: true`

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

AJV version: 

```
8.18.0
```
**Ajv options object**

```javascript
const opts = { code: { source: true, esm: true }, allErrors: true, coerceTypes: true }
```



**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{ "type": "string", "minLength": 5 }
```

**Sample data**


```json
 "not required"
```

**Your code**
```js
import Ajv from 'ajv'
import standaloneCode from 'ajv/dist/standalone/index.js'

const ajv = new Ajv({ code: { source: true, esm: true }, allErrors: true, coerceTypes: true })
const validate = ajv.compile({ type: 'string', minLength: 5 })
const code = standaloneCode(ajv, validate)
console.log(code)
```

quick check from your terminal
```bash
cd "/Users/kursat/dev/cervice/(schema)/ajv" && node --input-type=module <<'EOF'
import Ajv from 'ajv'
import standaloneCode from 'ajv/dist/standalone/index.js'

const ajv = new Ajv({ code: { source: true, esm: true }, allErrors: true, coerceTypes: true })
const validate = ajv.compile({ type: 'string', minLength: 5 })
const code = standaloneCode(ajv, validate)
console.log(code)
EOF
2>&1
```

**Generated Result**

```js
"use strict";export const validate = validate10;export default validate10;const schema11 = {"type":"string","minLength":5};const func2 = require("ajv/dist/runtime/ucs2length").default;function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;if(typeof data !== "string"){let dataType0 = typeof data;let coerced0 = undefined;if(!(coerced0 !== undefined)){if(dataType0 == "number" || dataType0 == "boolean"){coerced0 = "" + data;}else if(data === null){coerced0 = "";}else {const err0 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "string"},message:"must be string"};if(vErrors === null){vErrors = [err0];}else {vErrors.push(err0);}errors++;}}if(coerced0 !== undefined){data = coerced0;if(parentData !== undefined){parentData[parentDataProperty] = coerced0;}}}if(typeof data === "string"){if(func2(data) < 5){const err1 = {instancePath,schemaPath:"#/minLength",keyword:"minLength",params:{limit: 5},message:"must NOT have fewer than 5 characters"};if(vErrors === null){vErrors = [err1];}else {vErrors.push(err1);}errors++;}}validate10.errors = vErrors;return errors === 0;}
```

**What results did you expect?**
```js
"use strict";import func2 from "ajv/dist/runtime/ucs2length";export const validate = validate10;export default validate10;const schema11 = {"type":"string","minLength":5};function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;if(typeof data !== "string"){let dataType0 = typeof data;let coerced0 = undefined;if(!(coerced0 !== undefined)){if(dataType0 == "number" || dataType0 == "boolean"){coerced0 = "" + data;}else if(data === null){coerced0 = "";}else {const err0 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "string"},message:"must be string"};if(vErrors === null){vErrors = [err0];}else {vErrors.push(err0);}errors++;}}if(coerced0 !== undefined){data = coerced0;if(parentData !== undefined){parentData[parentDataProperty] = coerced0;}}}if(typeof data === "string"){if(func2(data) < 5){const err1 = {instancePath,schemaPath:"#/minLength",keyword:"minLength",params:{limit: 5},message:"must NOT have fewer than 5 characters"};if(vErrors === null){vErrors = [err1];}else {vErrors.push(err1);}errors++;}}validate10.errors = vErrors;return errors === 0;}
```

**Are you going to resolve the issue?**
I am not familiar with ajv codebase :/