# [2504] ajv.compileParser is not found

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

I was trying to use `compileParser`, but it appears the method is not exported. Am I doing something wrong?

Docs: https://ajv.js.org/api.html#ajv-compileparser-schema-object-json-string-any

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Latest at this time: 8.17.1

**Reproduction**

```javascript
import Ajv from 'ajv'

const ajv = new Ajv()
ajv.compileParser()
// ^ Property 'compileParser' does not exist on type 'Ajv'
```

[Playground](https://www.typescriptlang.org/play/?#code/JYWwDg9gTgLgBAQQFYDc4DMoRHA5AQ1VwChiBjCAOwGd5C0BeOSgUwHdFUAKASmPoB0FcMAA2LAAr4o1FlF7EgA).

**What results did you expect?**

The `compileParser` method to be available.

**Are you going to resolve the issue?**

Not sure.
