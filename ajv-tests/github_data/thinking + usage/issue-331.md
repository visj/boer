# [331] How to set dataPath to custom validation error?

I created custom keyword

``` javascript
ajv.addKeyword('validatePassword', {
  async: true,
  schema: false,
  validate: function (data) {
    return userRepository.findByEmail(data.email)
      .then(user => {
        if (user === null) {
          throw new ajv.ValidationError([{
            dataPath: '.email',
            keyword: 'validatePassword',
            message: 'Неверный email или пароль',
            params: {keyword: 'validatePassword'},
          }]);
        }
        return securityService.validatePassword(data.password, user.password);
      });
  },
  errors: true
});
```

and schema

``` json
{
  "$async": true,
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "format": "email"
    },
    "password": {
      "type": "string"
    }
  },
  "required": ["email", "password"],
  "validatePassword": true
}
```

now `dataPath` equals to "" but I want that `dataPath` was equal to ".email". How to do this?
