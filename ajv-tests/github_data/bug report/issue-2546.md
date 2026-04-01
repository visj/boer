# [2546] Unexpected behavior when using `removeAdditional`

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
```
    "ajv": "^8.17.1",
    "ajv-formats": "^3.0.1",
```
**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{ keywords: ['example'], removeAdditional: "all", allErrors: true }
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  allOf: [
    {
      type: "object",
      properties: {
        test1: {
          type: "string",
          description: "Test 1",
        }
      }
    },
    {
      type: "object",
      properties: {
        test2: {
          type: "number",
          description: "Test 2",
        }
      }
    }
  ]
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  test1: "test",
  test2: 123,
}
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
import Ajv from "ajv";
import AjvAddFormats from "ajv-formats";

export const ajv = new Ajv({ keywords: ['example'], removeAdditional: "all", allErrors: true });
AjvAddFormats(ajv);

const validate = ajv.compile(/*sample schema*/);

const data = /*sample data*/;

console.log("Before:", data);

validate(data);

console.log("After:", data);
console.log("Errors:", validate.errors);
```

**Validation result, data AFTER validation, error messages**

```
Before: {
  test1: "test",
  test2: 123,
}
After: {}
Errors: null
```

**What results did you expect?**
I expected that the sample data would not be modified because it fits the schema.

**Are you going to resolve the issue?**
Most likely not.