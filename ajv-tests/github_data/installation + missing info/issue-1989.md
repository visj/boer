# [1989] serialize is not a function

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.12.5

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript

      meta: {
        $schema: 'http://json-schema.org/draft-07/schema#',
      },
      $data: true,
      allErrors: true,
      jsonPointers: true,
    }

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json

```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json

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

```javascript
    const defaultOptions = {
      meta: {
        $schema: 'http://json-schema.org/draft-07/schema#',
      },
      $data: true,
      allErrors: true,
      jsonPointers: true,
    };
    const ajv = new Ajv({
      ...defaultOptions,
    });
```

**Validation result, data AFTER validation, error messages**

```

```

**What results did you expect?**

expect to init an ajv object

**Are you going to resolve the issue?**
throw error "serialize is not a function"
I set a debug point, it seems to be a string, not a function
![image](https://user-images.githubusercontent.com/16400128/169526077-11520c5f-a153-42ed-ac46-b242027eae1f.png)

