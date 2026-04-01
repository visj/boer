# [2199] Strict Mode check not take account of $ref

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.11.2

**Ajv options object**
strict: true
<!-- See https://ajv.js.org/options.html -->

Reproduce code:
```javascript
    new Ajv({
            strict: true,
        })
            .addSchema({
                $schema: 'http://json-schema.org/draft-07/schema#',
                $id: 'my-defs.json',
                definitions: {
                    Foo: {
                        type: 'object',
                        properties: {
                            foo: {
                                type: 'string',
                            },
                        },
                    },
                },
            })
            .compile({
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                properties: {
                    nested: {
                        $ref: 'my-defs.json#/definitions/Foo',
                        additionalProperties: false,
                        // type: 'object', <=== add redundant type def will make error go away
                    },
                },
            })
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


**Validation result, data AFTER validation, error messages**
Got   strict mode: missing type "object" for keyword "additionalProperties" at "#/properties/nested"
```

```

**What results did you expect?**
no error
**Are you going to resolve the issue?**
