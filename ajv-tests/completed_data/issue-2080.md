# [2080] Ajv is not accepting null value for a string type that is defined to be nullable

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
`6.12.6`

**Ajv options object**
I am using the default options

**JSON Schema**


```json
 {
    "type": "object",
    "properties": {
      "val1": { "type": "string", "nullable": true },
    },
  }
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
 {
    "val1": null,
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
it("validates nullable string", () => {
  const schema = {
    type: "object",
    properties: {
      val1: { type: "string", nullable: true },
    },
  };
  const hash = {
    val1: null,
  };

  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  const valid = validate(hash);

  console.log(JSON.stringify(validate.errors, null, 2));
  expect(valid).toEqual(true);
});
```

**Validation result, data AFTER validation, error messages**

```
    [
      {
        "keyword": "type",
        "dataPath": ".val1",
        "schemaPath": "#/properties/val1/type",
        "params": {
          "type": "string"
        },
        "message": "should be string"
      }
    ]

expect(received).toEqual(expected) // deep equality

    Expected: true
    Received: false
```

**What results did you expect?**
- It should accept `null` as a valid value for `val1`.
- Am I defining the schema correctly? 

**Are you going to resolve the issue?**
I am not sure how.