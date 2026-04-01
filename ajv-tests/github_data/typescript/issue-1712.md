# [1712] JTDDataType no unions created for oneOf

Want to make sure I'm not missing something and that `oneOf` doesn't generate the union types when using `JTDDataType`
<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

`8.6.2`

**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->

```typescript
import { JTDDataType } from "ajv/dist/jtd";

const schema = {
  "type": "object",
  "properties": {
    "foo": {
      "type": "string",
    },
    "bar": {
      "type": "string",
    },
  },
  "oneOf": [
    { "required": [ "foo" ] },
    { "required": [ "bar" ] }
  ]
};

export type TestType = JTDDataType<typeof schema>

// Invalid
const testType: TestType = {
  foo: ""
}
```

**Typescript compiler error messages**

```
TS2322: Type '{ foo: string; }' is not assignable to type '{ foo: unknown; bar: unknown; } & {}'.   Property '"bar"' is missing in type '{ foo: string; }' but required in type '{ foo: unknown; bar: unknown; }'. 
```

**Describe the change that should be made to address the issue?**

Type is generated with unions specified in oneOf

**Are you going to resolve the issue?**

No