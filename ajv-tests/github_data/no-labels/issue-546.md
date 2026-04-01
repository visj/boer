# [546] Async compile stuck in loop

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

I am using the latest version of Ajv.

What am I doing wrong?
I want to use the GeoJSON schema but `loadSchema`goes into a endless loop.

**Ajv options object**

```javascript
{
  loadSchema(uri) {
     // fetch(uri)
     return Promise.resolve(/* http://json-schema.org/draft-04/schema */)
  }
}
```

<!-- See https://github.com/epoberezkin/ajv#options -->



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
const ajv = new Ajv({...})
ajv.compileAsync(/* https://raw.githubusercontent.com/SchemaStore/schemastore/master/src/schemas/json/geojson.json */)
```
