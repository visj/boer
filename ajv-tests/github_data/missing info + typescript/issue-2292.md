# [2292] e.instancePath is undefined

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

```js
const validate = ajv.compile(jsonSchema)
validate(value)
validate[0].instancePath
```
There is however a schemaPath and a dataPath

<img width="531" alt="image" src="https://github.com/ajv-validator/ajv/assets/9112811/1b928bb0-9f84-418b-aa37-231e2a54182c">

The TS shows an `instancePath` and `schemaPath` but no `dataPath`

```js
export interface ErrorObject<K extends string = string, P = Record<string, any>, S = unknown> {
    keyword: K;
    instancePath: string;
    schemaPath: string;
```

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

```
"ajv": "^8.12.0",
```

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

**What results did you expect?**

TS types to match the actual data

**Are you going to resolve the issue?**

Happy to but wanted to see if I'm doing something wrong
