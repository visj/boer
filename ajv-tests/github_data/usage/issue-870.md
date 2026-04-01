# [870] Validate only returning first error

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.5.4

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript

```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{ 
   "properties": { 
       "email": { "type": "string" },
       "password": { "type": "string" },
        "firstName": { "type": "string" },
        "lastName": { "type": "string" } 
    },
   "required": [ "email", "password", "firstName", "lastName" ],
   "type": "object",
   "definitions": {} 
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
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.



It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

[https://runkit.com/myrddraall/5bc4e37afa061f0012b5bf75](https://runkit.com/myrddraall/5bc4e37afa061f0012b5bf75)

```javascript
const ajv = new Ajv();
ajv.validate(schema, data);
console.log(ajv.errors);

```


**Validation result, data AFTER validation, error messages**

```
[ { keyword: 'required',
    dataPath: '',
    schemaPath: '#/required',
    params: { missingProperty: 'email' },
    message: 'should have required property \'email\'' } ]
```

**What results did you expect?**

I would expect an error for each of the required fields rather than only email

**Are you going to resolve the issue?**
