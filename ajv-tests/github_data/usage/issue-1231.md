# [1231] removeAdditional not work with allOf

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

want to accomplish following requirements with ajv:

- validate data with schema
- drop additional properties not provided in schema

but it not work with allOf

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

`"ajv": "^6.12.2",`

**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv#options -->

```javascript

const ajv = new Ajv({
  coerceTypes: "array",
  removeAdditional: "all", // strip any property not in openapi.yml
});
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
const schema = {
  allOf: [
    {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", description: "pet's name" },
        age: { type: "integer" },
      },
    },
    {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        createAt: { type: "string", format: "time" },
      },
    },
  ],
};

```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```javascript
const data = {
  name: "tom",
  age: 1,
  add: "2020-06-14T08:41:56.872Z",
  createdAt: "2020-06-14T08:41:56.872Z",
  id: "5ee5b284e6e6e1e49c916bf2",
};

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
const validator = ajv.compile(schema);

if (!validator(data)) {
  console.log(validator.errors);
}

console.log(data);
/*
{}
*/

```


**Validation result, data AFTER validation, error messages**

```
[
  {
    keyword: 'required',
    dataPath: '',
    schemaPath: '#/allOf/1/required',
    params: { missingProperty: 'id' },
    message: "should have required property 'id'"
  }
]

```

**What results did you expect?**

`console.log(data)` expected:

```
const data = {
  name: "tom",
  age: 1,
  createdAt: "2020-06-14T08:41:56.872Z",
  id: "5ee5b284e6e6e1e49c916bf2",
};
```

but we got:

```
{}
```
