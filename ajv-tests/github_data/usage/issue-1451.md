# [1451] How to validate every type of object inside an array

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?** 6.12.5

**What problem do you want to solve?** 
validate every object inside a array, those objects are in different types

**What do you think is the correct solution to problem?**
I don't know

**Will you be able to implement it?**
my implementation:

```
// array object definition
export default {
  type: "array",
  items: {
    "anyOf": [
      typeOne,
      typeTwo,
    ],
  },
}

// type one defination:
typeOne = {
    type: 'object',
    required: ['lat', 'lng'],
    properties: {
      lat: {
      type: 'number',
    },
    lng: {
      type: 'number',
    },
  },
}
// type two definition:
typeTwo = {
  type: 'object',
  required: ['x', 'y', 'z'],
  properties: {
    x: {
      type: 'number',
    },
    y: {
      type: 'number',
    },
    z: {
      type: 'number',
    },
  },
}

```
