# [1987] anyOf returns repeated errors

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

```json
"ajv": "^8.11.0",
"ajv-formats": "^2.1.1",
```

**Ajv options object**
<!-- See https://ajv.js.org/options.html -->
I am using Ajv with `allErrors` option, a few keywords and formats as well

```javascript
const ajv = new Ajv({allErrors: true})
const formats: FormatName[] = ['date']
this.validator = addFormats(ajv, formats).addKeyword('kind').addKeyword('modifier')
```

**JSON Schema**
<!-- Please make it as small as possible to reproduce the issue -->
My schema is being generated through another package called [typebox](https://github.com/sinclairzx81/typebox/). This is what the schema looks like when it's passed to Ajv for the validation.

```javascript
{
  kind: Symbol(ObjectKind),
  type: 'object',
  properties: {
    enumProperty: {
      kind: Symbol(EnumKind),
      anyOf: [Array],
      modifier: Symbol(OptionalModifier)
    }
  }
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "enumProperty": "invalid-value"
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

Not relevant at this point, I think.

**Validation result, data AFTER validation, error messages**

```
"data/enumProperty must be equal to constant, data/enumProperty must be equal to constant, data/enumProperty must be equal to constant, data/enumProperty must be equal to constant, data/enumProperty must be equal to constant, data/enumProperty must be equal to constant, data/enumProperty must match a schema in anyOf"
```

**What results did you expect?**

I would like to have a simple message indicating that the value is not valid for the schema and the acceptable values for that property:

```
"data/enumProperty must match a schema in anyOf: ["value1", "value2"]"
```

If that's not possible, than just the first part would suffice:

```
"data/enumProperty must match a schema in anyOf"
```

**Are you going to resolve the issue?**

Unlikely
