# [924] uniqueItems do not work

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Latest. Yes.

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{} // none
```
**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
      "type": "array",
      "items": { "uniqueItems": true, "type": "object", "properties": { "foo": { "type": "number" } } }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
[{ "foo": 1 }, { "foo": 1 }]
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
const ajv = new Ajv();
const s: JSONSchema = {
      type: 'array',
      items: { uniqueItems: true, type: 'object', properties: { foo: { type: 'number' } } }
    };
const v = ajv.compile(s);
console.log(v([{ foo: 1 }, { foo: 1 }])); // prints: true
console.log(v.errors) // prints null
```

**Validation result, data AFTER validation, error messages**

```
```

**What results did you expect?**

It should fail, because I provide two same elements.

**Are you going to resolve the issue?**

Unfortunately no.