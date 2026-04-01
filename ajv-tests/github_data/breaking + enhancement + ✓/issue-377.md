# [377] For successful asynchronous validations, return the validated data instead of `true`

**What version of Ajv you are you using?**
`4.10.0`

**What problem do you want to solve?**

When using asynchronous validation, it is likely that the user will be doing something with the data object after it is validated. Since the `then` is reached only if the data object is valid, it's not useful to have it return a `true` value. Instead, if it returned the now-validated original data object, we could then easily chain things.

**What do you think is the correct solution to problem?**

Say we have the following simplified application:

```javascript
const AJV = require('ajv'),
      ajv = new AJV();

const validate = ajv.compile({
  "$async": true,
  "properties": { ... }
});
```

Now say we want a `render` function that first checks whether the given `something` object is valid and then actually renders it when the object is valid.

```javascript
function render(something) {
  return validate(something)
    .then(function (valid) {
      // "valid" is always true here
      actuallyRender(something);
    })
    .catch(function (err) {
      if (!(err instanceof Ajv.ValidationError)) throw err;
      // data is invalid
      console.log('Validation errors:', err.errors);
    });
}

function actuallyRender(something) {
  console.log('Actually rendering', something);
}
```

For the `then`, we have to create a new function which then calls what we actually want to do with the data object. The `render` function could be simplified if the `validate` resolve value was the valid data object:

```javascript
function render(something) {
  return validate(something)
    .then(actuallyRender)
    .catch(function (err) {
      // ...
    });
}
```

**Will you be able to implement it?**

I looked through the source, but I'm not seeing where to modify this return value.