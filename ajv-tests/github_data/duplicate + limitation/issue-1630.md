# [1630] Removing a schema doesn't remove the schema and can still validate against it from the instance

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Yes, using latest, v8.5.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{ code: { optimize: false } }
```

**JSON Schema**

Please see the code section - this is not about a specific schema or data, but about how the ajv instance is retaining a copy of "removed" schemas.

**Sample data**

Please see the code section - this is not about a specific schema or data, but about how the ajv instance is retaining a copy of "removed" schemas.

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

Here's a codesandbox link with the issue: 
https://codesandbox.io/s/ajv-playground-forked-qlry4?file=/src/index.js:44-73

```javascript
import Ajv from "ajv";

const ajv = new Ajv({ code: { optimize: false } });

ajv.addSchema(
  { type: "object", properties: { field0: { type: "number" } } },
  "schema"
);
console.log(ajv.getSchema("schema").schema);
console.log(ajv.validate("schema#/properties/field0", 3));
console.log(ajv.validate("schema#/properties/field0", "abc"));
// you cannot add the same key twice!
// ajv.addSchema({ type: "object", properties: { field0: { type: "number" } } }, "schema");

ajv.removeSchema("schema");
ajv.addSchema(
  { type: "object", properties: { field1: { type: "string" } } },
  "schema"
);
console.log(ajv.getSchema("schema").schema);
console.log(ajv.validate("schema#/properties/field0", 3));
console.log(ajv.validate("schema#/properties/field0", "abc"));
console.log(ajv.validate("schema#/properties/field1", 3));
console.log(ajv.validate("schema#/properties/field1", "abc"));

```

**Validation result, data AFTER validation, error messages**

```

{type: "object", properties: Object}
true
false
{type: "object", properties: Object}
true
false
false
true
```

**What results did you expect?**

After removing the first schema, a call to `ajv.validate("schema#/properties/field0", 3)` would throw an error.

**Are you going to resolve the issue?**

I would first like to confirm that this is an issue, and is not by design. If so, I might be interested.