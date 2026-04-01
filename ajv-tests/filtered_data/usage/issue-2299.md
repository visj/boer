# [2299] ajv treats undefined and null differently when evaluating if-then in schema

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.12.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{}

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```typescript
interface MyModel {
  name: string,
  link?: string | null,
  linkDetails?: string,
}

const schema: JSONSchemaType<MyModel> = {
  type: "object",
  properties: {
    name: { type: "string" },
    link: { type: "string", nullable: true },
    linkDetails: { type: "string", nullable: true },
  },
  required: ["name"],
  if: { properties: { link: { type: "string", minLength: 2 } } },
  then: { required: ["linkDetails"] },
}

```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "name": "test"
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

```typescript
import Ajv2019 from "ajv/dist/2019"

const ajv2019 = new Ajv2019()
const validator = ajv2019.compile<MyModel>(schema)

// NOTE: this first test has the unexpected result, the rest are as expected
validator({
  name: "test 1",
  // no link defined, should not require linkDetails
})
console.log("\ntest 1 - no link (should be valid but has errors)", validator.errors)

validator({
  name: "test 2",
  link: null,  // link is null, should not require linkDetails
})
console.log("\ntest 2 - link null (valid)", validator.errors)

validator({
  name: "test 3",
  link: "something", // now requires linkDetails
})
console.log("\ntest 3 - link but no details (not valid - errors expected)", validator.errors)

validator({
  name: "test 4",
  link: "something", // now requires linkDetails
  linkDetails: "hello",
})
console.log("\ntest 4 - link and details (valid)", validator.errors)

```

**Validation result, data AFTER validation, error messages**

```
test 1 - no link (should be valid but has errors) [
  {
    instancePath: '',
    schemaPath: '#/then/required',
    keyword: 'required',
    params: { missingProperty: 'linkDetails' },
    message: "must have required property 'linkDetails'"
  }
]

test 2 - link null (valid) null

test 3 - link but no details (not valid - errors expected) [
  {
    instancePath: '',
    schemaPath: '#/then/required',
    keyword: 'required',
    params: { missingProperty: 'linkDetails' },
    message: "must have required property 'linkDetails'"
  }
]

test 4 - link and details (valid) null
```

**What results did you expect?**

I expect the first test to pass validation: if the `link` property is not there (i.e. it is `undefined`), then its length can never be 2 or more and the `then` schema should not apply.

**Are you going to resolve the issue?**

I'm hoping for a workaround!