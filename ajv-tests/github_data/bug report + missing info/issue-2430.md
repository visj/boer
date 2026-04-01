# [2430] How to return error when the vlaue of field is '' and set the field as required

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**

latest

**What problem do you want to solve?**

`const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Name',
      minLength: 1,
    },
  },
  required: ['name'],
}`

`
const valid = ajv.compile(schmea)({name:''});

// valid is true

// Can i get required error when name is ''?

`

**What do you think is the correct solution to problem?**

can we add some option to change the behavior?

**Will you be able to implement it?**
