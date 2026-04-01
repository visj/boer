# [2275] ajv.validateSchema does not validate properly for schemas using $data

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
draft-07

Note that in the example I did not require draft-07 explicitly, but I can set the `meta: false` option and add the draft-07 option explicitly - the same issue occurs

```javascript
const Ajv = require('ajv');
const dataMetaSchema = require('ajv/lib/refs/data.json')

const ajv = new Ajv();
ajv.addMetaSchema(dataMetaSchema)

const schema = {
    type: 'object',
    properties: {
        a: {type: 'number'},
        b: {type: 'number', minimum: {$data: '/a'}}
    }
};


const isValid = ajv.validateSchema(schema);

console.log(isValid);
console.log(ajv.errors);
```


**Validation result**

```
[{
      keyword: 'type',
      dataPath: ".properties['b'].minimum",
      schemaPath: '#/properties/minimum/type',
      params: { type: 'number' },
      message: 'should be number'
}]
```

**What results did you expect?**

If using the meta-schema which allows $data keyword, then schemas which use this keyword should also be valid.
Note that using the schema itself to validate the data will validate correctly.

**Are you going to resolve the issue?**
