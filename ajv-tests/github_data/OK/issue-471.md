# [471] exclusiveMinimum is supposed to be boolean. Error: "exclusiveMinimum should be number"

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

```javascript
// package.json
{ "ajv": "^5.0.0" }
```

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
// Probably unrelated
var Ajv = require('ajv');
var ajv = new Ajv({ loadSchema: loadSchema });
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->
(Partial schema)
```json
{
  "properties": {
    "factor": {
      "type": "number",
      "minimum": 0,
      "exclusiveMinimum": true
    }
  }
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
var ajv = new Ajv({ loadSchema: loadSchema });

function loadSchema(uri) {
    console.log(`Loading Schema: ${uri}`);

    return request(uri).then(function(res) {
        var schema = JSON.parse(res);
        return schema;
    });
}

var schema = ajv.compileAsync({
    "$ref": "some web url"
});
schema.then(() => {
    //...
}.catch((err) => {
    // err.message == "schema is invalid: data.definitions['meterpoint'].properties['factor'].exclusiveMinimum should be number"
})
```

**What results did you expect?**
exclusiveMinimum is supposed to be boolean. 
http://json-schema.org/latest/json-schema-validation.html#rfc.section.5.5

**Are you going to resolve the issue?**
No, I'm going to remove exclusiveMinimum from my schema for the time being.