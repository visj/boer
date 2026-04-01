# [1452] How to custom error message in case of keyword with `compile` instead of `validate`? (c.f. #161)

```
ajv.addKeyword('auth', {
  validate: function validate (schema, data) {
    validate.errors = [{keyword: 'auth', message: 'shoud be authenticated.', params: {keyword: 'auth'}}];
    return false;
  },
  errors: true
});
```

_Originally posted by @epoberezkin in https://github.com/ajv-validator/ajv/issues/161#issuecomment-210383187_