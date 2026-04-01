# [1397] ajv@^7.0.0 fails to compile JSON Schemas with "email" format

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

^7.0.0

**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv/api.md/api.md#options -->

```javascript
import Ajv from 'ajv';

const ajv = new Ajv();

const validateRequestBody = (bodySchema: JSONSchema7) => (
  req: Request,
  _: Response,
  next: NextFunction,
) => {
  // This blows up with the schema below
  const validate = ajv.compile(bodySchema);

  const isPayloadValid = validate(req.body);

  isPayloadValid
    ? next()
    : next(new ValidationError({ invalid_params: validate.errors }));
};
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```jsonc
import { JSONSchema7 } from 'json-schema';

const signupSchema: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Signup request payload',
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      description: 'User account email address',
    },
    password: {
      type: 'string',
      minLength: 1,
      description: 'Keys to the kingdom',
    },
  },
};
```

**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```jsonc
{
  email: "hello@hello.com",
  password: "cookie"
}
```

**What results did you expect?**

This works in < ^7.0.0, i.e. last working version is 6.12.6