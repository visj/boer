# [1294] `coerceTypes: "array"` when combined with `oneOf` may produce invalid result

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

v6.12.5

**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv#options -->

```javascript
{ coerceTypes: "array" }
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "object",
  "properties": {
    "foo": {
      "oneOf": [
        { "const": "*" },
        { "type": "array", "items": { "type": "string", "pattern": "^[A_Z]+$" } }
      ]
    }
  }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{ "foo": "*" }
```


**Validation result, data AFTER validation, error messages**

```
{ foo: [ '*' ]  }
```

**What results did you expect?**

I didn't expect coercion to be made on value that doesn't validate against `items` schema, and buggy side effect of that is that input value was changed to one which no longer matches the schema.

I believe by design validation should not produce results which no longer validates against same schema.

Additionally I observed that coercion to array is forced even if singular value is accepted

e.g. _string_ value will be put into array with schema as `oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }]`, and interesting quirk is that it'll impose a validation error, as internals will assume that both variants were matched.
