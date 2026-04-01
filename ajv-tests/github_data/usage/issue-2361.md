# [2361] Error: strict mode: unknown keyword: "errorMessage"

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

I am on version 8.12.0.  I believe this should be the latest version.  

**Ajv options object**

Default option: no custom params.

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    title: "schema",
    $schema: "http://json-schema.org/draft-07/schema",
    type: "object",
    properties: {
      known: {
        type: "string",
      },
    },
    additionalProperties: {
      not: true,
      errorMessage: "extra property is ${0#}",
    },
  }
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "known": "test",
  "unknown": "test"
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
const schema = {
    title: "schema",
    $schema: "http://json-schema.org/draft-07/schema",
    type: "object",
    properties: {
      known: {
        type: "string",
      },
    },
    additionalProperties: {
      not: true,
      errorMessage: "extra property is ${0#}",
    },
  };

  // Validate the schema
  const validator = new Ajv().compile(schema);
  const valid = validator({
  "known": "test",
  "unknown": "test"
});
  if (!valid) {
    log.error("Invalid schema:");
    log.error(validator.errors);
    throw new Error("Invalid schema");
  }
```

**Validation result, data AFTER validation, error messages**

```
Error: strict mode: unknown keyword: "errorMessage"
```

**What results did you expect?**

I should see this validate the json string and see the error message similar to this.
```
Error: strict mode: no additional properties extra property is `unknown`
```

**Are you going to resolve the issue?**

I haven't looked into this repo.  But if I get some direction to location of bug and I can look into it.
