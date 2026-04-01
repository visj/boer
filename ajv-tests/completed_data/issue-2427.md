# [2427] compileAsync does not loadSchema a schema that is $ref’d by a oneOf with a discriminator

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

latest (8.13.0)

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const options = {
  discriminator: true,
  async loadSchema(url) {
    console.log('loadSchema', url)
    const name = url.substring("scheme://".length)
    return schemas[name]
  },
};
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```js
const schemas = {
  main: {
    type: "object",
    discriminator: {propertyName: "foo"},
    required: ["foo"],
    oneOf: [
      {
        $ref: "scheme://schema1",
      },
      {
        $ref: "scheme://schema2",
      },
    ],
  },
  schema1: {
    type: "object",
    properties: {
      foo: {const: "x"},
    },
  },
  schema2: {
    type: "object",
    properties: {
      foo: {enum: ["y", "z"]},
    },
  },
};
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{"foo": "x"}
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
const Ajv = require("ajv");
const ajv = new Ajv(options);
// If you uncomment this, then there is no error
// Object.entries(schemas).forEach(([id, schema]) => {
//   ajv.addSchema(schema, 'scheme://' + id)
// })
async function main() {
  const validate = await ajv.compileAsync(schemas.main)
  validate(data)
}
main().catch((err) => console.log(err))
```

**Validation result, data AFTER validation, error messages**

```
Error: discriminator: oneOf subschemas (or referenced schemas) must have "properties/foo"
```

**What results did you expect?**
No error

**Are you going to resolve the issue?**
Maybe if it is easy

Notes:
* If you call `ajv.addSchema` (i.e., uncomment the commented code), then the error goes away. Therefore, it is the resolving of the `$ref` that is the issue
* When `discriminator: true`, then `loadSchema` is **not** called.
* But if you set `discriminator: false` and remove the `discriminator` from `schema.main`, then `loadSchema` **is** called.

  ```
  loadSchema scheme://schema1
  loadSchema scheme://schema2
  ```

My guess is that lib/vocabularies/discriminator/index.ts’s `getMapping()` needs to `throw new MissingRefError` so that _compileAsync can catch the error and load the missing schemas.