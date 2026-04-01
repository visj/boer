# [1470] User defined formats with standalone validation code

**The error we're seeing is:**

`Error: CodeGen: "code" for formats0 not defined`

Oddly this error does not occur if we use Ajv in our app, it only occurs if we try to make a standalone validator script.

**What version of Ajv are you using? Does the issue happen if you use the latest version?** 7.1.1 (latest)

**Ajv options object**

```javascript
const ajv = new Ajv({
  code: {
    source: true, // this option is required to generate standalone code
  },
  removeAdditional: true,
});
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```js
const demoSchema = {
  $id: 'demoSchema',
  additionalProperties: false,
  properties: {
    test: hexCodeValidator,
  },
};
```

**Sample data**

N/A - bug occurs during compilation of standalone Ajv.

**Your code**

### [Repro](https://runkit.com/slapbox/603ad69eba5c45001c1d550f)

**Are you going to resolve the issue?**

I cannot resolve the issue.