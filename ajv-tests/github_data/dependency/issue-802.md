# [802] default values - RangeError: Maximum call stack size exceeded

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

`6.5.0`

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{useDefaults: false}

```


**JSON Schema**

```javascript

function Default() {}
Default.prototype.toJSON = function toJSON() {
    return {};
};

const def = new Default;

def.prop = {
    Default: def // it fails because of this circular enumerable property
};

const schema = {
    type: 'object',
    properties: {
        prop: {
            type: 'object',
            default: def
        }
    }
};


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
ajv.addSchema(schema, 'test');


```


**Validation result, data AFTER validation, error messages**

```
RangeError: Maximum call stack size exceeded
    at _traverse (/path/to/project/node_modules/json-schema-traverse/index.js:58:5)
    at _traverse (/path/to/project/node_modules/json-schema-traverse/index.js:72:9)
    at _traverse (/path/to/project/node_modules/json-schema-traverse/index.js:72:9)
    at _traverse (/path/to/project/node_modules/json-schema-traverse/index.js:72:9)
    at _traverse (/path/to/project/node_modules/json-schema-traverse/index.js:72:9)
    at _traverse (/path/to/project/node_modules/json-schema-traverse/index.js:72:9)
    at _traverse (/path/to/project/node_modules/json-schema-traverse/index.js:72:9)
    at _traverse (/path/to/project/node_modules/json-schema-traverse/index.js:72:9)
    at _traverse (/path/to/project/node_modules/json-schema-traverse/index.js:72:9)
    at _traverse (/path/to/project/node_modules/json-schema-traverse/index.js:72:9)


```

**What results did you expect?**
When `useDefaults=false` I'd expect that `ajv` is gonna ignore `default` keyword and not traverse its enumerable properties.
Although it should not fail even with `useDefaults=true` when the default value object implements `toJSON` method.

**Are you going to resolve the issue?**
possible bugfix provided here:
https://github.com/epoberezkin/json-schema-traverse/pull/5

In ajv library, used here:
https://github.com/epoberezkin/ajv/blob/master/lib/compile/resolve.js#L239