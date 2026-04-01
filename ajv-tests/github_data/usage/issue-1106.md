# [1106] removeAdditional=failing removing non-failing property

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.10.2 - Latest


**Ajv options object**



```javascript
{ allErrors: true, removeAdditional: "failing", schemaId: "auto" }

```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    additionalProperties: false,
    definitions: {
      ApprovalRule: {
        anyOf: [
          {
            $ref: "#/definitions/ITypeA",
          },
          {
            $ref: "#/definitions/ITypeB",
          },
        ],
      },
      "Types.typeA": {
        enum: ["TypeA"],
        type: "string",
      },
      "Types.typeB": {
        enum: ["TypeB"],
        type: "string",
      },
      InnerType: {
        additionalProperties: false,
        properties: {
          stage: {
            type: "number",
          },
          userId: {
            type: "number",
          },
        },
        required: ["userId", "stage"],
        type: "object",
      },

      ITypeA: {
        additionalProperties: false,
        properties: {
          type: {
            $ref: "#/definitions/Types.typeA",
          },
        },
        type: "object",
      },

      ITypeB: {
        additionalProperties: false,
        properties: {
          TypeBProp: {
            items: {
              $ref: "#/definitions/InnerType",
            },
            type: "array",
          },

          type: {
            $ref: "#/definitions/Types.typeB",
          },
        },
        required: ["type"],
        type: "object",
      },
    },
    id: "http://schemas.com/ITestType",
    properties: {
      rule: {
        $ref: "#/definitions/ApprovalRule",
      },
    },
    type: "object",
  };

```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json

{
    id: NaN,
    approvalEnabled: true,
    version: 1,
    rule: { type: "TypeB", TypeBProp: [{ stage: 1, userId: 17 }, { stage: 2, userId: 15 }] },
  }
```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript

const ajv = new Ajv({ allErrors: true, removeAdditional: "failing", schemaId: "auto" });


  it("should", () => {
    ajv.validate(schema, json);
    expect(ajv.errors).toBeNull();
    expect(json).toEqual({ rule: { type: "TypeB", TypeBProp: [{ stage: 1, userId: 17 }, { stage: 2, userId: 15 }] } });
  });
```


**Validation result, data AFTER validation, error messages**

```
{ rule: { type: "TypeB" } }

```

**What results did you expect?**
Property TypeBProp should not have been removed.
I've read the docs, and thought setting it to "failing" would only remove properties that would fail the entire schema?


