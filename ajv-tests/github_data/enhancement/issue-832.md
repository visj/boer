# [832] IPv4 address matches both `ipv4` and `hostname` formats

Please see this [SO answer](https://serverfault.com/a/638270) for more information.

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

6.5.2, yes

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{}
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "type": "object",
    "properties": {
        "host": {
            "type": "string",
            "oneOf": [
                { "format": "hostname" },
                { "format": "ipv4" }
            ]
        }
    }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
    "host": "127.0.0.1"
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

* Gist: https://gist.github.com/GochoMugo/ee1363ca2274743ca612d2393819a723
* Runkit: https://runkit.com/gochomugo/ajv-issue/1.0.1

```javascript
var Ajv = require("ajv");

ajv = new Ajv({
});

var schema = {
    "type": "object",
    "properties": {
        "host": {
            "type": "string",
            "oneOf": [
                { "format": "hostname" },
                { "format": "ipv4" }
            ]
        }
    }
};

var data = {
    "host": "127.0.0.1"
};

var validate = ajv.compile(schema);

console.log(validate(data));
console.log(validate.errors);
```


**Validation result, data AFTER validation, error messages**

```
false
[ { keyword: 'oneOf',
    dataPath: '.host',
    schemaPath: '#/properties/host/oneOf',
    params: { passingSchemas: [Array] },
    message: 'should match exactly one schema in oneOf' } ]
```

**What results did you expect?**

1. It only matches `ipv4` format, and **not** `hostname` format

**Are you going to resolve the issue?**

No, maybe. :man_shrugging: 