# [821] Required custom

I've been using ajv recently and I'm having a question.

**Schema file (user.json)**
```json
{
  "title": "User",
  "type": "object",
  "properties": {
    "fullname": {"type": "string", "minLength": 3, "maxLength": 200},
    "email": {"type": "string", "format": "email"},
    "emailConfirmation": {"type": "string", "format": "email"},
    "username": {"type": "string", "minLength": 6, "maxLength": 50},
    "password": {"type": "string", "minLength": 6},
    "passwordConfirmation": {"type": "string", "minLength": 6},
    "birthday": {"type": "string", "format": "date"}
  }
}
```

In the login and reset password methods I would like to make required fields the password and passwordConfirmation.
In the register user method I would like to make required fields the fullname, email, emailConfirmation and username.

What is the best practice for this solution?

**Coding sample**
```javascript
var Ajv = require('ajv')
// ...
var ajv = new Ajv({allErrors: true})
// ...
exports.reset = (req, res) => {
  if (!userValidate(req.body)) return res.send(userValidate.errors)

  User
    .update({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, {
      password: req.body.password,
      resetPasswordToken: null,
      resetPasswordExpires: null
    })
    .then((user) => res.send('Your password has been changed'))
    .catch((err) => res.send(err))
}
```