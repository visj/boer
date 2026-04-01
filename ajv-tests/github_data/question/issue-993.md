# [993] OpenApi attribute nullable with enum

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.10.0


**Ajv options object**
```javascript
{
  nullable: true
}

```

<!-- See https://github.com/epoberezkin/ajv#options -->

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "object",
  "properties": {
    "propertyOne": { 
      "type": "string",
      "nullable": true,
      "enum": [ "foo", "bar" ]
    }
  }
}

```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
  "propertyOne": null
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
var ajv = new Ajv(options);
var validate = ajv.compile(schema);
var result = validate(data);

```


**Validation result, data AFTER validation, error messages**

```json
[
  {
    "keyword": "enum",
    "dataPath": ".propertyOne",
    "schemaPath": "#/properties/propertyOne/enum",
    "params": {
      "allowedValues": [
        "foo",
        "bar"
      ]
    },
    "message": "should be equal to one of the allowed values"
  }
]

```

**What results did you expect?**
The result to be true, since support for the keyword nullable has be set to true and schema has set nullable to true for the property "propertyOne".


**Are you going to resolve the issue?**
Not sure
