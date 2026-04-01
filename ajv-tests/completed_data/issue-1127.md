# [1127] "addUsedSchema: false" won't validate the data

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

* `"ajv": "6.10.2"`


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
const ajv = new Ajv({
  // Disable adding JSON Schema Draft 7 meta schema by default.
  // Allows to always add a meta schema depending on the schema version.
  meta: false,
  // No need to validate schema again, already validated
  // in "validateSchema()" method.
  validateSchema: false,
  errorDataPath: 'property',
  jsonPointers: true
  addUsedSchema: false
});
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "$id": "http://json-schema.org/draft-06/schema#",
  "type": ["object"],
  "required": ["foo"],
  "properties": {
    "foo": {
      "type": "number"
    }
  }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
  "foo": "invalid-value"
}
```

> The issue is reproducible as well when the data object is empty. Should produce an error saying "required property foo is missing".


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
// Add meta schema explicitly because my method operates
// with JSON Schema Draft versions 6/7
ajv.addMetaSchema(this.jsonMetaSchema);
const validate = ajv.compile(this.jsonSchema);
validate(data);
```

**Validation result, data AFTER validation, error messages**

Nothing to share, AJV states the given data as valid, `ajv.errors` is `undefined`.

**What results did you expect?**

I expect for `ajv.errors` to contain a single error saying "foo should be of type number".

**Are you going to resolve the issue?**

Of course, just please give me a hint of what is going wrong.
