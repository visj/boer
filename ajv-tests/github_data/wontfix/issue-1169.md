# [1169] strictKeywords not checked for addSchema()

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.12.0

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{
  strictKeywords: true
}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$id": "//foo",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "p1": {
      "type": "string",
      "readonly": true
    }
  },
  "required": ["p1"]
}
```
Note `readOnly` is improperly capitalized in the schema.

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
const ajv = new Ajv(options);

try {
  ajv.addSchema(schema);
  console.log(`addSchema passed`);
} catch(e) {
  console.log(`addSchema failed: ${e}`);
}

try {
  ajv.compile(schema);
  console.log(`compile passed`);
} catch(e) {
  console.log(`compile failed: ${e}`);
}
```

**Actual Result**

```
addSchema passed
compile failed: Error: unknown keyword: readonly
```

**What results did you expect?**
I expected the typoed `readonly` (correct is `readOnly`) keyword to be caught when I called `addSchema()`, but it is only caught upon `compile()`.  This confuses me because the documentation of `addSchema()` says that it validates the schema.  Reading between the lines, I think `strictKeywords` controls something distinct from validation, but that isn't explicitly stated in the docs.

For my use case, the whole reason I'm using `addSchema()` is because I want to fail-fast upon startup of my app if there's a bad schema.  With the existing behavior, the schema isn't compiled until first use, which means my app doesn't detect the error until I try to validate a web request against the broken schema.

**Are you going to resolve the issue?**
Only if someone can point me to where the change needs to be made.