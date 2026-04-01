# [1103] ajv validate always return true

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
```
ajv: 6.10.2
typescript-json-schema: 0.40.0
```


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript


```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
// ISoccerPayloadSchema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "ISport": {
      "type": "object",
      "properties": {
        "propA": {
          "type": "number"
        }
      },
      "required": [
        "propA"
      ]
    }
  }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```ts
interface ISport {
  propA: number;
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

```ts
import * as AJV from "ajv";
import * as json from "../node/schema/ISoccerPayloadSchema.json";

describe("JSON Schema", () => {
  it("ajv test", () => {
    // Arrange
    const ajv = new AJV();
    const validate = ajv.compile(json);

    // Act
    const validString = validate({ propA: "h" });
    const validNumber = validate({ propA: 1 });
    const validBoolean = validate({ propA: false });
    const validObject = validate({ propA: { msg: "hello world" } });
    const validNull = validate(null);
    const validUndefined = validate(undefined);

    // Assert
    expect(validString).toBe(true);
    expect(validNumber).toBe(true);
    expect(validBoolean).toBe(true);
    expect(validObject).toBe(true);
    expect(validNull).toBe(true);
    expect(validUndefined).toBe(true);
  });
});
```


**Validation result, data AFTER validation, error messages**

```


```

**What results did you expect?**
I wanted my code to work properly. But all `expect` are true in that code. What's I'm missing?

**Are you going to resolve the issue?**
