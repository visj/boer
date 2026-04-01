# [209] How to get several values of properties within a validation function?

I want to create the authentication schema, but my custom keyword `validatePassword` need two schema properties `email` and `password` to then check the user credentials against the database. I don't  understand how can i get the value of email property within my validatePassword function ?

Here is my simple example.

``` javascript
{
    "$async": true,
    "type": "object",
    "properties": {
      "email": {
        "allOf": [
          {"type": "string"},
          {"format": "email"}
        ]
      },
      "password": {
        "allOf": [
          {"type": "string"},
          {"validatePassword": true}
        ]
      }
    },
    "require": ['email', 'password']
  }

validator.addKeyword('validatePassword', {
    async: true,
    compile: function (schema, parentSchema) {
      return function validate (data) {
        return User.where('email', HERE_I_NEED_THE_VALUE_OF_EMAIL_PROPERTY).fetch()
          .then(model => {
            if (model === null) {
              return false;
            }
            return validatePassword(data, model.get('password'));
          });
      }
    },
    errors: true
});
```

How can I get the email value instead `HERE_I_NEED_THE_VALUE_OF_EMAIL_PROPERTY` string within my validatePassword function ?

How to solve similar problems with ajv? Thanks.
