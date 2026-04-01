# [1200] ajv-keywords typeof function and default

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.12.2

**Ajv options object**

```javascript
{ useDefaults: true }
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```js
{
  "type": "object",
  "properties": {
      "foo": { "typeof": "function", "default": () => {} }
  }
}
```


**Sample data**

See below.


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
https://runkit.com/satazor/5eac34960c2691001afd90ab

**Validation result, data AFTER validation, error messages**

Throws:

> should pass \"typeof\" keyword validation

**What results did you expect?**

Because the `foo` prop has a default set to `() => {}`, it should not throw.
The **issue** is that `ajv` is doing `JSON.stringify` on the default value, to clone values. However, that should not be done for functions, and possible other types.

~~Using `{ useDefaults: 'shared' }` fixes the issue, but it does introduce other problematic side-effects.~~ Actually, there's a missing `function` entry here: https://github.com/epoberezkin/ajv/blob/3b735371e74bf847146e07b59172a6d4485cc44a/lib/compile/index.js#L238

**Are you going to resolve the issue?**

I may try.
