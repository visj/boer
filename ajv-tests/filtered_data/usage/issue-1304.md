# [1304] Regex pattern not validated correctly

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->
Problem: A pattern `[0-9]{5}` with the input `123456` (one char too long) does not lead to a validation error.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
7.0.0-beta-1

Instead of filling out the template I provide a codesandbox, which is hopefully ok?
https://codesandbox.io/s/intelligent-driscoll-zh7l1?file=/src/index.js

here is the minimal reproduction:
```javascript
import Ajv from "ajv";
const schema = {
  $id: "https://example.com/form.schema.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "form",
  type: "object",
  properties: {
    zipCode: { title: "plz", type: "string", pattern: "[0-9]{5}" }
  },
  required: ["zipCode"]
};

const ajv = new Ajv();
const v = ajv.compile(schema);
// zipCode has a length of 6, which is too long
v({ zipCode: "123456" });
console.log(v.errors); // null, no errors present - which is wrong

// zipCode has a length of 4, which is too short
v({ zipCode: "1234" });
console.log(v.errors); // error, input does not match pattern - which is correct

```

**What results did you expect?**
the input "123456" should result in a validation error

**Are you going to resolve the issue?**
no
