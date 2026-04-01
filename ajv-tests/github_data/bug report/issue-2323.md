# [2323] Required capture wrongly on nested array object

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->
I suspect that the `required` rules malfunction for array object, as you can see below the example the `stid` and `postcode` value exists but been rejected by ajv. Or, anything I did wrongly?


**What version of Ajv are you using? Does the issue happen if you use the latest version?**
    "ajv": "^8.12.0"
    "ajv-formats": "^2.1.1"

**Ajv options object**


<!-- See https://ajv.js.org/options.html -->

```javascript
const ajv = new Ajv({ allErrors: true });
```

**JSON Schema (i'd make it as typescript object as below)**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
 {
    type: 'object',
    properties: {
      name: {
        type: 'object',
        properties: {
          firstName: { type: 'string', default: '', examples: ['KS Tan'] },
          lastName: { type: 'string' },
        },
        required: ['firstName', 'lastName'],
      },
      age: { type: 'integer' },
      email: { type: 'string', format: 'email' },
      dob: { type: 'string' },
      hobbies: { type: 'array', items: { type: 'string' } },
      addresses: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            stid: { type: 'string' },
            street: {
              type: 'object',
              properties: { st1: { type: 'string' }, st2: { type: 'string' } },
              required: ['stid', 'postcode'],
            },
            postcode: { type: 'integer' },
            updated: { type: 'string' },
          },
          required: ['stid', 'postcode', 'updated'],
        },
      },
    },
    required: ['name', 'email', 'dob', 'hobbies', 'addresses'],
  }
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
 { "doctype": "Person", "name": { "firstName": "firstname", "lastName": "lastname" }, "age": 123, "email": "my@email.com", "dob": "2023-08-15", "hobbies": [ "asd", "dwf", "e" ], "addresses": [ { "stid": "1111", "street": { "st1": "st1", "st2": "st2" }, "postcode": 232323, "updated": "2000-01-01" } ] }

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

```javascript
const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);

    const validate = ajv.compile(this.schema);
    const valid = validate(this.data.value);
    if (!valid) {
      console.error(validate.errors);
      return validate.errors;
    } else {
      return false;
    }
```

**Validation result, data AFTER validation, error messages**

```json
[
    {
        "instancePath": "/addresses/0/street",
        "schemaPath": "#/properties/addresses/items/properties/street/required",
        "keyword": "required",
        "params": {
            "missingProperty": "stid"
        },
        "message": "must have required property 'stid'"
    },
    {
        "instancePath": "/addresses/0/street",
        "schemaPath": "#/properties/addresses/items/properties/street/required",
        "keyword": "required",
        "params": {
            "missingProperty": "postcode"
        },
        "message": "must have required property 'postcode'"
    }
]
```

**What results did you expect?**
it should no return any error message

**Are you going to resolve the issue?**
no, sorry i not good at this.