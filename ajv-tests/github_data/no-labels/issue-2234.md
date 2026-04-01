# [2234] Question: how to get enum definition values from referenced schema

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports. For other issues please use:
- security vulnerability: https://tidelift.com/security)
- a new feature/improvement: https://ajv.js.org/contributing/#changes
- browser/compatibility issues: https://ajv.js.org/contributing/#compatibility
- JSON-Schema standard: https://ajv.js.org/contributing/#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.12.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```
{ verbose: true }
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```
const schema = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "main_schema",
    title: "Main List",
    type: "array",
    items: {
      type: "object",
      properties: {
        route: {
          type: ["string", "null"],
          title: "Route",
          description: "Route",
          $ref: "shared_schema#/definitions/routes",
        }
      },
      required: ["route"]
    }
  };

const shared_schema = {
  $id: "shared_schema",
  title: "MyProject shared values",
  definitions: {
    routes: {
      enum: [
        "ROUTE1",
        "ROUTE2",
        "ROUTE3"
      ],
      errorMessage:
        "Route must be an allowed value: ${/definitions.routes.enum.join(', ')}"
    }
  }
};

```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```
const data = [{route: "INVALID"}]

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

```
const ajv = ajvError(new Ajv({ verbose: true }));
ajv.addSchema(shared_schema, "shared_schema").compile(shared_schema);
const valid = ajv.validate(schema, data);

```

**Validation result, data AFTER validation, error messages**

```
Route must be an allowed value: undefined

```

**What results did you expect?**
```
Route must be an allowed value: ROUTE1, ROUTE2, ROUTE3
```
**Are you going to resolve the issue?**
```
No
```

I am unable to get list of allowed values. Tried a lot of things, this might now be the correct syntax to get the reference but that's what i want to figure out.