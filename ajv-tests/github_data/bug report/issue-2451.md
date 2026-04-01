# [2451] Cannot get sub-schema validation to work

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.16.0 (latest)

**Your code**

Link to runkit: https://runkit.com/mikesnare/ajv-issue

```javascript
var Ajv = require('ajv');

ajv = new Ajv({
    // options here
});

var schema = {
  '$id': 'https://whatever.com/simple-schema',
  type: "object",
  additionalProperties: false,
  definitions: {
    CustomType: { enum: [ 'one', 'two' ], type: 'string' },
    SimpleType: {
      additionalProperties: false,
      properties: {
        id: { type: 'number' },
        custom_type: { '$ref': '#/definitions/CustomType' }
      },
      required: [ 'id' ],
      type: 'object'
    }
  }
};

var data = {
    what: 'ever',
};

ajv.addSchema(schema);
const validate = ajv.getSchema('https://whatever.com/simple-schema#definitions/SimpleType')

console.log(validate(data));
console.log(validate.errors);

```

**Validation result, data AFTER validation, error messages**

There is no validation result, because no validation function is returned.  It simply fails.

**What results did you expect?**

I expected ajv to find the correct validator based on the given path.

**Are you going to resolve the issue?**

I don't know how to answer this question.