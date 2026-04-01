# [1947] Unable to use anyOf for the typescript type contains array union property 

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
8.10.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{
  allErrors: true,
  verbose: true,
}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "object",
    "properties": {
      "data": {
          "name": {
            "anyOf": [
              {
                "type": "string",
                "nullable": true,
                "enum": ["alice", "bob"],
              },
              {
                "type": "array",
                "nullable": true,
                "items": {
                  "type": "string",
                  "enum": ["alice", "bob"],
                },
              },
            ],
          },
      "required": [],
    },
  },
  "required": [],
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
// name as string type
{
  "data": {
    "name": "alice"
  }
}

// name as array of string
{
  "data": {
    "name": ["alice", "bob"]
  }
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

```typescript
type Foo = {
  data: {
    name: string | string[]
  }
}

const schema: JSONSchemaType<Foo> =  {
  "type": "object",
    "properties": {
      "data": {
          "name": {
            "anyOf": [
              {
                "type": "string",
                "nullable": true,
                "enum": ["alice", "bob"],
              },
              {
                "type": "array",
                "nullable": true,
                "items": {
                  "type": "string",
                  "enum": ["alice", "bob"],
                },
              },
            ],
          },
      "required": [],
    },
  },
  "required": [],
}
```

**Validation result, data AFTER validation, error messages**

```
type ... is missing the following properties from type ... : type, items

```

**What results did you expect?**
It should be able to apply anyOf or oneOf for the union type contains array or object type. 
Applying `as any` to the properties works but it sacrifice a benefit of type safe.

**Are you going to resolve the issue?**
Maybe