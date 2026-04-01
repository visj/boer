# [1167] AJV reports data as invalid against a schema but the errors property is null when running batches of data

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

ajv 6.11.0
ajv-keywords 3.4.1

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
    this.ajv = new AJV({
      $data: true,
      allErrors: true,
      useDefaults: true,
      verbose: true,
      format: 'full',
      loadSchema: this._loadRelatedSchema,
    });
```


**JSON Schema**

See Repo: https://github.com/JaredCE/ajv-test


**Sample data**

See Repo: https://github.com/JaredCE/ajv-test


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

See Repo: https://github.com/JaredCE/ajv-test 

I'm unsure how to reproduce in runkit easily since it relies on async compile.


**Validation result, data AFTER validation, error messages**

```


```

**What results did you expect?**
When my code processes more than one schema in an `Promise.all` and AJV finds an invalid schema, the error object from the `compileAsync(schema)` should contain the errors.

This is not the case, it shows an invalid schema, but the errors object is null.  running a single bit of bad data in the Promise.all brings back the error object, but when running with a batch of data... it's null.

**Are you going to resolve the issue?**
not sure how.