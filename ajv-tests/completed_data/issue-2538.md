# [2538] `strictSchema: "log"` throws on some schema compile errors

# Quick description of the issue

In
https://github.com/ajv-validator/ajv/blob/82735a15826a30cc51e97a1bbfb59b3d388e4b98/lib/vocabularies/format/format.ts#L82-L87
`strictSchema === false` logs an error, whereas `strictSchema === "log"` throws

Based on the docs in
https://github.com/ajv-validator/ajv/blob/82735a15826a30cc51e97a1bbfb59b3d388e4b98/docs/options.md?plain=1#L96-L104

I would expect `strictSchema === "log"` to log and `strictSchema === true` to throw.

# Issue template

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.17.1
Yes

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{ strictSchema: "log" }
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://json.schemastore.org/ruff.json",
  "title": "Options",
  "type": "object",
  "properties": {
    "Flake8CopyrightOptions": {
      "description": "Options for the `flake8-copyright` plugin.",
      "type": "object",
      "properties": {
        "min-file-size": {
          "description": "A minimum file size (in bytes) required for a copyright notice to be enforced. By default, all files are validated.",
          "type": [
            "integer",
            "null"
          ],
          "format": "uint",
          "minimum": 0
        }
      }
    }
  }
}
```

**Sample data**

irrelevant

**Your code**

```javascript
import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true, strictSchema: "log" });

const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://json.schemastore.org/ruff.json",
  title: "Options",
  type: "object",
  properties: {
    Flake8CopyrightOptions: {
      description: "Options for the `flake8-copyright` plugin.",
      type: "object",
      properties: {
        "min-file-size": {
          description:
            "A minimum file size (in bytes) required for a copyright notice to be enforced. By default, all files are validated.",
          type: ["integer", "null"],
          format: "uint",
          minimum: 0,
        },
      },
    },
  },
};

const validate = ajv.compile(schema);

const data = {
  foo: 1,
  bar: "abc",
}; // this doesn't matter

validate(data);
console.log(validate.errors);
```

**Validation result, data AFTER validation, error messages**

```
                throw new Error(unknownMsg());
                      ^
Error: unknown format "uint" ignored in schema at path "#/properties/Flake8CopyrightOptions/properties/min-file-size"
```

**What results did you expect?**

With `{ strictSchema: "log" }`, I would expect this error to be logged (like it is when `strictSchema` is `false`), not thrown as an exception.

**Are you going to resolve the issue?**

I have not contributed before, but I would be happy to try and submit a PR if you agree this is a bug.
