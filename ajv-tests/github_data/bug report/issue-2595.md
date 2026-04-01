# [2595] JTD parser fails on empty array that has whitespace between brackets

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.18.0 (latest at time of submission)

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
import Ajv, { JTDDataType } from "ajv/dist/jtd";
const ajv = new Ajv();
```

**JSON Type Definition**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{"properties": { "data": { "elements": { "type": "string"} } }
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{"data": [ ]}
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
import Ajv, { JTDDataType } from "ajv/dist/jtd";

import schema from './schema.json'; // Contains JTD above

const ajv = new Ajv();

export type SchemaType = JTDDataType<type of schema>;
export const dataParser = ajv.compileParser<SchemaType>(schema);

const text = `{"data": [ ]}`;
const parsedData = dataParser(text);

console.log(parsedData);
console.log(dataParser.message);
console.log(dataParser.position);
```

**Validation result, data AFTER validation, error messages**

```
undefined
unexpected token ]
10
```

**What results did you expect?**
Parser should not fail on an empty array that contains white spaces.

**Are you going to resolve the issue?**
I will open a PR. It is a one line fix - we just need to add `skipWhitespace(cxt)` to `lib/compile/jtd/parse.ts` in `parseElements` method before calling `parseItems`.
