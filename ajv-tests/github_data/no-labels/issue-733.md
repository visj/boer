# [733] i want to validate against array with unique strings so i add custom keyword to trim string then use uniqueItems in array but not as i expected uniqueItems run before trim so are there way to control flow to make trim run first then uniqueItems ?

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



**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript


```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json


```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json


```


**Your code**
 uniqueItems: {
                    allOf: [
                        {
                            type: 'array',
                            minItems: 1,
                            uniqueItems: true,
                        },
                        { 
                            items: {
                                type: 'string',
                                minLength: 1,
                                trim: true,                    
                            },
                        },
                    ],
                }
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


```


**Validation result, data AFTER validation, error messages**

```


```

**What results did you expect?**


**Are you going to resolve the issue?**
