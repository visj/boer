# [2155] the required property on a JSONSchemaType<any> is a never []

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
I'm using 8.11.0, the latest version (as of writing)
**Your typescript code**

```typescript

import * as ajv from "ajv"
const test: ajv.JSONSchemaType<any> = {
    "type": "object",
    "$id": "test",
    "properties": {
        "sss": {
            "type": "string",
            "nullable": true
        }
    },
    "required": ["sss"]
}
```

**Typescript compiler error messages**

```
Type '{ type: "object"; $id: string; properties: { sss: { type: "string"; nullable: true; }; }; required: string[]; }' is not assignable to type 'UncheckedJSONSchemaType<any, false>'.
  Types of property '"required"' are incompatible.
    Type 'string[]' is not assignable to type 'readonly never[]'.
      Type 'string' is not assignable to type 'never'.

```

**Describe the change that should be made to address the issue?**
`required` should be typed as a `string[]`
**Are you going to resolve the issue?**
In case this issue will not be resolved by someone else, I will try to resolve it.