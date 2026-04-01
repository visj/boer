# [161] How to create a custom error message?

I read the [docs](http://epoberezkin.github.io/ajv/custom.html#define-keyword-with-validation-function) and try to do a test method:

```
ajv.addKeyword('auth', {
  validate: function (schema, data) {
    this.errors = [{keyword: 'auth', message: 'shoud be authenticated.', params: {keyword: 'auth'}}];
    return false;
  },
  errors: true
});
```

but this don't work. How to make a right?
