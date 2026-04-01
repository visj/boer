# [2355] JSON parsing fails for v8 versions 11.7.72 and newer

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
v8.12.0

**Ajv options object**
not used

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "properties": {
    "test": { "type": "uint8" }
  },
  "additionalProperties": true
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
      "test": 1,
      "error": "now"
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
const Ajv = require("ajv/dist/jtd");

const JTDschema = {
  properties: {
    test: { type: "uint8" },
  },
  additionalProperties: true,
};

const payload = `{
        "test": 1,
        "error": "now"
  }`;

const ajv = new Ajv();

const parser = ajv.compileParser(JTDschema);

const output = parser(payload);

if (!output) {
  console.log(parser.position);
  console.log(parser.message);
}
```

**Console output**

```
47
unexpected end
```

**What results did you expect?**
Validates successfully, no console output

**Are you going to resolve the issue?**
Yes, patch is already written, PR incoming

**Additional context**
v8 11.7.72 changed the message templates for JSON parsing related error messages (https://chromium-review.googlesource.com/c/v8/v8/+/4652014)  
This breaks `parseJson()` and leads to parsing errors if utilizing `additionalProperties` in a JSONTypeDefinition (other issues not specifically tested).  
`npm test` also produces several errors with the mentioned v8 version.  
This can be tested with NodeJS v21.0.0 or newer and deno v1.36.1 or newer since those versions updated their respective v8 versions past the affected version