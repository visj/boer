# [1035] Cannot run select example

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

Hello,
I have a problem running the sample code from the documentation of the select keyword, could you please help me resolve this?

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

ajv: 6.10.0
ajv-errors: 1.0.1
ajv-keywords: 3.4.0

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript


```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json


```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json


```


**Your code**

This is the code from ajv-keywords documentation for select keyword, with an adaptation to trace the errors found in the sample data

```javascript
var Ajv = require('ajv');
var ajv = new Ajv({allErrors: true, jsonPointers: true, $data: true});
var ajvErr = require('ajv-errors');
require('ajv-keywords')(ajv);

var schema = {
    type: 'object',
    required: ['kind'],
    properties: {
        kind: {type: 'string'}
    },
    select: {$data: '0/kind'},
    selectCases: {
        foo: {
            required: ['foo'],
            properties: {
                kind: {},
                foo: {type: 'string'}
            },
            additionalProperties: false
        },
        bar: {
            required: ['bar'],
            properties: {
                kind: {},
                bar: {type: 'number'}
            },
            additionalProperties: false
        }
    },
    selectDefault: {
        propertyNames: {
            not: {enum: ['foo', 'bar']}
        }
    }
};

var validDataList = [
    {kind: 'foo', foo: 'any'},
    {kind: 'bar', bar: 1},
    {kind: 'anything_else', not_bar_or_foo: 'any value'}
];

var invalidDataList = [
    {kind: 'foo'}, // no propery foo
    {kind: 'bar'}, // no propery bar
    {kind: 'foo', foo: 'any', another: 'any value'}, // additional property
    {kind: 'bar', bar: 1, another: 'any value'}, // additional property
    {kind: 'anything_else', foo: 'any'}, // property foo not allowed
    {kind: 'anything_else', bar: 1} // property bar not allowed
];


ajvErr(ajv);
const validate = ajv.compile(schema);

for (const current of validDataList) {
    validate(schema, current);
    if (validate.errors && validate.errors.length) {
        for (const error of validate.errors) {
            console.error(error);
        }
    }
}


for (const current of invalidDataList) {
    validate(schema, current);
    if (validate.errors && validate.errors.length) {
        for (const error of validate.errors) {
            console.error(error);
        }
    }
}


```


**Validation result, data AFTER validation, error messages**

Every validate raise the same error

```
{ keyword: 'required',
  dataPath: '[object Object]',
  schemaPath: '#/required',
  params: { missingProperty: 'kind' },
  message: 'should have required property \'kind\'' }

```

**What results did you expect?**

Valid samples should not raise any error, invalid sample should raise corresponding error

**Are you going to resolve the issue?**
