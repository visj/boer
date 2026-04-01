# [796] DeprecationWarning: Custom inspection function on Objects via .inspect() is deprecated

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

Deprecation message is shown when custom keyword tries to modify parent object.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.5.0
yes
Node.js version v10.0.0

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```
const Ajv = require("ajv");
const ajv = new Ajv({allErrors: true, jsonPointers: true});
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```
{
    type: "object",
    properties: {
        _id: {
            type: "string",
            mongoId: true
        }
    }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```
{_id: "5b0f5a665890714db8821ad2"}
```


**Your code**
Complete code to reproduce issue:
<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```
const Ajv = require("ajv");
const ajv = new Ajv({
    allErrors: true,
    jsonPointers: true
});
const mongodb = require("mongodb");
const createMongoId = function(id) {
    try {
        if (id) {
            return new mongodb.ObjectID(id);
        } else {
            return new mongodb.ObjectID();
        }
    } catch (err) {
        return null;
    }
};
ajv.addKeyword("mongoId", {
    validate: function (schema, data, parentSchema, path, parentObject, parentProperty) {
        if (!data) {
            return false;
        }
        let id = createMongoId(data);
        if (!id) {
            return false;
        }
        parentObject[parentProperty] = id;
        return true;
    },
    errors: false,
    modifying: true
});
const schema = {
    type: "object",
    properties: {
        _id: {
            type: "string",
            mongoId: true
        }
    }
};
const data = {_id: "5b0f5a665890714db8821ad2"};
const validate = ajv.compile(schema);
const valid = validate(data);
```


**Validation result, data AFTER validation, error messages**

During validation following message is displayed:

> (node:16181) [DEP0079] DeprecationWarning: Custom inspection function on Objects via .inspect() is deprecated

**What results did you expect?**
No deprecation warning.

**Are you going to resolve the issue?**
No