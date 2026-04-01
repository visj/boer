# [362] Add allowed values to error message for enum validation rule

**What version of Ajv you are you using?**
4.9.0

**What problem do you want to solve?**
When I use enum rule, the error message lacks information about why it failed.
There are two issues here:

1. The error message is: 'should be equal to one of the allowed values', but I can't find the allowed values in message.
1. The param field in returned error object is not correct when values contains object.
  If the rule is [{name: 'test', value: 'new' }], then the param field of the error object is: [Object]

**What do you think is the correct solution to problem?**

1. Add allowed values to error message, using JSON.stringify() to convert array to string
1. Using JSON.stringify() to convert array to string

**Will you be able to implement it?**

Yes, I can create a pull request to improve it.
