# [743] additional properties are not filtered out in certain case

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
`6.3.0`


**Ajv options object**
```javascript
{
    allErrors: false,
    additionalProperties: true,
    removeAdditional: true,
}
```

**JSON Schema**

```javascript
const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        contributors: {
            type: "object",
            additionalProperties: false,
            properties: {
                a: { type: 'string' },
                b: { type: 'string' },
                c: { type: 'string' },
                d: { type: 'string' },
                e: { type: 'string' },
                f: { type: 'string' },
            }
        },
    }
};
```


**Sample data**

```javascript
let obj= Object.create(null);
obj.__proto__ = null; //should be filtered out, however in certain case tn is not
obj.invalid = 'is filterred out';
obj.a = 'valid';
obj.b = 'valid';

let data = {contributors: obj};
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
let validator = new Ajv(options);
let result = validator.validate(schema, data)
```


**Validation result, data AFTER validation, error messages**

```
RESULT: true,
DATA AFTER VALIDATION:
{"contributors":{"__proto__":null,"a":"valid","b":"valid"}}
```

**What results did you expect?**
`__proto__` property (which is in this case a regular enumerable property) to not be present in the data object after validation.  

Please **NOTE** that if you remove any one of the properties listed in `schema#/properties/constributors/properties` so that overall number of defined properties is LESS than 6, the `__proto__` property will be correctly filtered out (deleted) from the data object (expected result).