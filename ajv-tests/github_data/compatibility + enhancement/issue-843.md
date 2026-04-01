# [843] Property 'missingProperty' does not exist on type 'ErrorParameters'.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

the latest version

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript

const ajv = new Ajv({ allErrors: true });
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json

{
  "$schema": "http://json-schema.org/draft-07/schema",
  "required": ["content", "className", "classNames"],
  "type": "object",
  "properties": {
    "content": {
      "name": "content",
      "type": "string",
      "title": "content",
      "description": "some content to render",
      "example": "content valid example"
    },
    "className": {
      "name": "className",
      "type": "string",
      "title": "className",
      "description": "some className content to render",
      "example": "className content valid example"
    },
    "classNames": {
      "name": "classNames",
      "type": "string",
      "title": "classNames",
      "description": "somed classNames content to render",
      "example": "classNames content valid example"
    }
  }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{"content": "some content"}

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
const valid = ajv.validate(schema, parsedConfig);
            if (!valid && ajv.errors) {
                ajv.errors.forEach(err => {
                    const prop = err.params.missingProperty;
                    const schemaProp = schema[prop];
                    console.error(`required property "${prop}" is missing.
                    description: ${schemaProp.description}
                    example: ${schemaProp.example}`);
                });
            }

```


**Not reaching the validation, the build using typescript fails**

```
TS2339: Property 'missingProperty' does not exist on type 'ErrorParameters'.
  Property 'missingProperty' does not exist on type 'RefParams'.

```

**What results did you expect?**
the code should build with no errors.

**Are you going to resolve the issue?**
I can resolve it. the solution is to normalize all the interfaces used for `type ErrorParameters` e.g. `RefParams | LimitParams | AdditionalPropertiesParams | ...`.

Please let me know if I can submit a PR