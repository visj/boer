# [969] make an option to use title instead of property name if title is available

I am using ajv with ajv-i18n to localize validation messages, which is great.

Problem is on required properties, since it is using the property name in the message. Is it possible to use the title instead if available? 

It would be benneficial even for english speaking users since instead of this:
```should have required property 'firstName'```
user would see this:
```should have required property 'First Name'```

Example schema with title
```js
const registerJsonSchema = {
  type: 'object',
  properties: {
    firstName: { type: 'string', title: 'Meno', minLength: 2, maxLength: 20 },
    ...
  },
  required: ['firstName', ...],
};
```