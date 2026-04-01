# [1173] schema for objects: patternProperties and properties treat `undefined` values differently

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Version: `6.12.0`

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->
- None, this is using the default `options`.


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```js
{
  type: "object",
  properties: {
    normalProp: { type: "string" }
  },
  patternProperties: {
    patternProp: { type: "string" }
  }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```js
{
  normalProp: undefined,
  patternProp: undefined
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
var ajv = new Ajv({});
var validate = ajv.compile(schema);

console.log(validate(data));
console.log(validate.errors);
```

https://runkit.com/yellowkirby/ajv-issue-pattern-properties

**Validation result, data AFTER validation, error messages**

```js
// validate.errors
[{
  dataPath: "['patternProp']"
  keyword: "type"
  message: "should be string"
  params: Object {type: "string"}
  schemaPath: "#/patternProperties/patternProp/type"
}]
```

**What results did you expect?**
I expected no validation errors. The sub-schema for `normalProp` and `patternProp` are identical, so they should both treat the literal `undefined` as a non-existent value (https://github.com/epoberezkin/ajv/issues/207#issuecomment-309576041)


**Are you going to resolve the issue?**
I'm hoping somebody more familiar with the codebase has a simple fix 🙏