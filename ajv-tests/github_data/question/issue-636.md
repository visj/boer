# [636] How to validate url such as http://localhost:3000

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

5.5.0

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript


```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json

const schema = {
     "properties": {
                "url": {
                    "type": "string",
                    "format": "url"
                }
            }
}

```

**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json

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

const Validator = require('ajv');
const validator = new Validator();

validator.addFormat('url', "(http|ftp|https)://[\w-]+(\.[\w-]+)*([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?")

const obj = {
       url: "http://localhost:4001"
 }

 const valid = validator.validate(schema, obj);
    const result = { valid, instance: obj };
    if (!valid) {
        result.error = validator.errorsText(validator.errors);
    }
    return result;

```


**Validation result, data AFTER validation, error messages**

```
url should match format \"url\""

```

**What results did you expect?**

valid: true

**Are you going to resolve the issue?**

NO
