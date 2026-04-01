# [1120] Question: Why is the generated function self mutative?

**What version of Ajv are you using? Does the issue happen if you use the latest version?** 6.10.2

I'm currently working on a project where I dynamically generate a node.js package from a set of json-schema definition files; I'm using ajv and ajv-pack, but have noticed that the function that is generated is self-mutative. That is, due to the return type being just a boolean, the errors get stuck onto the instance of the function.

The generated code reads (roughly) as follows:

```
module.exports = function validate(data) {
  // ...
  validate.errors = vErrors;
  return errors === 0;
}
```

This means that multiple validate calls will overwrite the `errors` value.

At the moment I'm doing something pretty nasty as a workaround, which is to wrap the generated code in a closure faking out `module` and then returning a function with a different signature.

The signature I was expecting is something like:

```
exports.validate = function validate(data) {
  // ...
  return {
    valid: errors === 0,
    errors: vErrors
  }
}
```

Such that using the built module would be: 

```
const Book = require('book-schema.js')

const { valid, errors } = Book.validate(someObj)

if (!valid) {
  ... something with errors
}
```

I'm just curious as to why a self-mutative API was chosen, as it seems rather strange to me?