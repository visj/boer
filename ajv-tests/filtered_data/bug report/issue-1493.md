# [1493] missingProperty undefined with ownProperties: true

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

7.2.1

**Ajv options object**


<!-- See https://github.com/ajv-validator/ajv/api.md/api.md#options -->

```javascript
const options = {
	ownProperties: true,
};
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "object",
  "required": [
    "a"
  ],
  "properties": {
    "a": {
      "type": "string"
    }
  }
}
```

**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{}
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
const ajv = new Ajv(options);
const foo = ajv.compile(schema);
foo(data);
assert.deepEqual(foo.errors[0], {
  keyword: 'required',
  dataPath: '',
  schemaPath: '#/required',
  params: { missingProperty: undefined },
  message: "should have required property 'undefined'",
});
```

**What results did you expect?**

missingProperty should be `'a'`, and message should reference it instead of undefined.

**Are you going to resolve the issue?**

If recommended as a good first issue.