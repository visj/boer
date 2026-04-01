# [1141] Unable to set custom validation message ?

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

I am using with Loopback 4 which internally uses AJV.

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript


```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
 @property({
    type: 'string',
    required: true,
    jsonSchema: {
      required: true,
      minLength: 4,
      message: { minLength: "Custom validation message" }
    }
  })
  email: string;

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


```


**Validation result, data AFTER validation, error messages**

```


```

**What results did you expect?**
I am trying to send a custom message whenever validation fails instead of it's own message. But it does not return any custom message. It keeps on sending the same message.

**Are you going to resolve the issue?**
