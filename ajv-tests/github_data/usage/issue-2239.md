# [2239] Question: changing the order of validation for enums

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

Enum validation fails before applying custom keyword compilation in AJV v8.x


```
ajv.addKeyword({
  keyword: 'upperCase',
  modifying: true,
  type: 'string',
  compile(sch) {
    if (sch) {
      return (data, { parentData, parentDataProperty }) => {
        parentData[parentDataProperty] = data.toUpperCase();
        return true;
      };
    }
    return false;
  },
  errors: false,
  metaSchema: {
    type: 'boolean',
  },
});

const schema = {
    type: "object",
    properties: {
        "prop1": {
            type: 'string',
            enum: ['A', 'B', 'C'],
            upperCase: true, // custom keyword
        }
    }
}

const validator = ajv.compile(schema)
const isValid = validator.validate({ prop1: 'a' })
console.log(validator.errors) 
```

output:
```
0: {
instancePath: ..., 
schemaPath: ..., 
keyword: 'enum', 
params: { allowedValues: ['A', 'B', 'C'] }, 
message: 'must be equal to one of the allowed values'
}
```

There were no errors in AJV v6.x, this is related to change in order validation in AJV introduced in ajv v7.x

Custom keyword compilation/transformation is happening after enum validation that is why it is failing, any work arounds? Thank you.


**What version of Ajv you are you using?**
v8.x

**What problem do you want to solve?**

**What do you think is the correct solution to problem?**

**Will you be able to implement it?**
