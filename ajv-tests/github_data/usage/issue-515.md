# [515] Defaults not assigned when using compileAsync

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

5.1.5 (latest)

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
useDefaults: true,
loadSchema: (uri) => {
  return request.json(uri).then(function (res) {
    if (res.statusCode >= 400)
      throw new Error('Loading error: ' + res.statusCode);
    return res.body;
  });
}
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "properties": {
        "foo": {
            "default": { "bar": 1 }
        }
    }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{}
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

You can view the demo repro runkit [here](https://runkit.com/irvinlim/5938c4be4bee060012f96553).

```javascript
// Asynchronous: Bug exists

const validator = new Ajv({
    useDefaults: true,
    loadSchema: uri => {
        return request.json(uri).then(function(res) {
            if (res.statusCode >= 400)
                throw new Error('Loading error: ' + res.statusCode);
            return res.body;
        });
    }
});

validator.compileAsync(testSchema, true).then(validate => {
    const data = {};

    console.log('Async validate: ' + validate(data));
    console.log('Async data: ' + JSON.stringify(data));
});

// Synchronous: Bug does not exist

const validator2 = new Ajv({
    useDefaults: true
});

const validate2 = validator2.compile(testSchema2);
const data2 = {};
console.log('Sync validate: ' + validate2(data2));
console.log('Sync data: ' + JSON.stringify(data2));
```


**Validation result, data AFTER validation, error messages**

```
Sync validate: true
Sync data: {"foo":{"bar":1}}
Async validate: true
Async data: {}
```

**What results did you expect?**

```
Sync validate: true
Sync data: {"foo":{"bar":1}}
Async validate: true
Async data: {"foo":{"bar":1}}
```

**Are you going to resolve the issue?**

I'll try to look into it if I have time. I haven't looked at the codebase so I'm not sure if I will be able to hunt down the issue.