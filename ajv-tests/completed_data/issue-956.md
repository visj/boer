# [956] Incorrect email format validation?

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.9.0


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{format: 'full'}

```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
{format: 'email'}

```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```javascript
data1 = '"(unusual)"@example.com';
data2 = 'email@[123.123.123.123]';

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

https://github.com/json-schema-org/JSON-Schema-Test-Suite/blob/master/index.js

**Validation result, data AFTER validation, error messages**

Validation fails, it should pass
See https://github.com/json-schema-org/JSON-Schema-Test-Suite/pull/253#issuecomment-466083889
