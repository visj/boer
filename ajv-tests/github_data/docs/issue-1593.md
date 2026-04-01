# [1593] JTD - Schema with discriminator does not compile (mistake in the docs)

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

Using the example from :
- https://ajv.js.org/guide/getting-started.html
- https://ajv.js.org/json-type-definition.html#discriminator-form

Am i doing something wrong?

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

`^8.2.0`

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
const ajv = new Ajv();

const schema = {
  discriminator: "version",
  mappings: {
    1: {
      properties: {
        foo: { type: "string" },
      },
    },
    2: {
      properties: {
        foo: { type: "uint8" },
      },
    },
  },
};

const validate = ajv.compile(schema);
const data = {
    version: "1",
    foo: "bar"
}
const valid = validate(data);
if (!valid) console.log(validate.errors);

```

**Validation result, data AFTER validation, error messages**

```
Error: schema is invalid: data/discriminator must NOT have additional properties, data must have property 'ref', data must have property 'type', data must have property 'enum', data must have property 'elements', data must have property 'properties', data must have property 'optionalProperties', data must have property 'mapping', data must have property 'values', data must match a schema in 
union
```

**What results did you expect?**
A successfull compilation

**Are you going to resolve the issue?**
Sorry i have no knowledge in AJV.