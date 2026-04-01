# [1465] The format type of 'email' validates for non email regex formats

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.12.4
**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv/api.md/api.md#options -->

```javascript

```

**JSON Schema**
Schema object:
username: {
      type: ['string'],
      format: 'email',
      maxLength: 30,
    },
<!-- Please make it as small as possible to reproduce the issue -->

```json

```

**Sample data**
data1 - userstring
data2 - user123@test.com
data3 - user@test

ajv successfully validates data2 as a valid email format and data1 as invalid one. But for data3 sample, it passes the validation instead it should have not allowed as the entry does not contain both the '@' and '.' character in it.
<img width="257" alt="ajv-git-data1" src="https://user-images.githubusercontent.com/72003560/108854701-4274d380-763c-11eb-91cf-d333b8fb3fa0.PNG">
<img width="258" alt="ajv-git-data2" src="https://user-images.githubusercontent.com/72003560/108854708-430d6a00-763c-11eb-8647-cafbd4abe18b.PNG">
<img width="261" alt="ajv-git-data3" src="https://user-images.githubusercontent.com/72003560/108854711-43a60080-763c-11eb-9c6f-c7e0ad12fd64.PNG">



<!-- Please make it as small as posssible to reproduce the issue -->

```json

```

**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
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
