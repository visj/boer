# [974] return property of the failing validation

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**
5.5

**What problem do you want to solve?**
Getting the property that failed the validation from the validation error.

Example:
```
{
  type: 'object',
  properties: {
    lastName: {
      type: 'string',
    },
  },
  required: ['lastName'],
}
```

This returns:

```
{ 
keyword: 'required',
  dataPath: '',
  schemaPath: '#/required',
  params: { missingProperty: 'lastName' },
  message: "should have required property 'lastName'" 
}
```

Is there an option to get which property failed? e.g. `lastName`.

Using the `params` object doesn't always suffice e.g:

```
{ 
  keyword: 'type',
  dataPath: '.lastName',
  schemaPath: '#/properties/lastName/type',
  params: { type: 'integer' } 
  message: "some message"
}
```

**What do you think is the correct solution to problem?**
Returning something like:
```
{ 
  property: 'lastName',
  keyword: 'required',
  dataPath: '',
  schemaPath: '#/required',
  params: { missingProperty: 'lastName' },
  message: "should have required property 'lastName'" 
}
```
**Will you be able to implement it?**
Maybe
