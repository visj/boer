# [1000] Validation for `date` format allows invalid dates

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.10.0


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->
```javascript
{
    allErrors: true,
},
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
   "type": "array",
    "items": {
        "type": "string",
        "format": "date",
    },
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
[
    "2018-02-29",
    "2018-02-35",
    "2018-15-01",
]
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
const ajv = new Ajv(options);
const isValid = ajv.validate(schema, data);
const errors = ajv.errors;
```

Also in [RunKit](https://runkit.com/maldimirov/ajv-issue-1000).

**Validation result, data AFTER validation, error messages**

```
isValid = true;
errors = null;
```

**What results did you expect?**
The validation should fail for all values. You can check the same issue in the [`enjoi` project](https://github.com/tlivings/enjoi/issues/63). It refers to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6). The validation should restrict the max date number to the specific month, taking into account leap years.

**Are you going to resolve the issue?**
Atm I haven't dug into `ajv`'s codebase to see how to resolve this. I have already done it using Regex in [enjoi](https://github.com/tlivings/enjoi/pull/64/files). So I can try or at least help :)