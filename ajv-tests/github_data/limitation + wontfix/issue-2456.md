# [2456] useDefaults doesn't work with conditional requires

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.16.0 - yes

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const ajv = new Ajv({
  allErrors: true,
  useDefaults: true,
  strict: false,
});

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```js
const schema = {
  type: 'object',
  properties: {
    useInterconnect: {
      type: 'boolean',
      default: false,
    },
    interconnectId: {
      type: 'string',
    },
  },
  allOf: [
    {
      if: {
        type: 'object',
        properties: {
          useInterconnect: { const: true },
        },
      },
      then: {
        required: ['interconnectId'],
      },
    },
  ],
};
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```js
const data = {};
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
https://runkit.com/timberbain/6671765baad1af0008237f25

```javascript
const validate = ajv.compile(schema);

const valid = validate(data);
console.log(data); // Log: { useInterconnect: false }

if (valid) {
  console.log('Data is valid:', data);
} else {
  console.log('Data is invalid:', validate.errors);
}
```

**Validation result, data AFTER validation, error messages**

```
 Data is invalid: [
  {
    instancePath: '',
    schemaPath: '#/allOf/0/then/required',
    keyword: 'required',
    params: { missingProperty: 'interconnectId' },
    message: "must have required property 'interconnectId'"
  },
  {
    instancePath: '',
    schemaPath: '#/allOf/0/if',
    keyword: 'if',
    params: { failingKeyword: 'then' },
    message: 'must match "then" schema'
  }
]

```

**What results did you expect?**
I expected no validation errors as useInterconnect has been defaulted to false.

Previously running the same code with version **6.12.6** (without the strict option as it was introduced in later version) the schema is considered valid. But after migrating to version 8.16.0, the data is no longer valid according to the schema.
