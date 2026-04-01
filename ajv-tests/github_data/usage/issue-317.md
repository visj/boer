# [317] Lack error details if validateSchema returns false

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

I am using 4.7.7

**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

``` javascript
{ allErrors: true, verbose: true }
```

**JSON Schema:**

NB: Illegal schema on purpose:

``` javascript
{
  '$schema': 'http://json-schema.org/draft-04/schema#',
  'type': 'object',
  'properties': {
    'username': 'string',
    'password': {
      'type': 'any'
    }
  },
  'required': [
    'username',
    'password'
  ]
}

```

**Your code (please use `options`, `schema` and `data` as variables):**

``` javascript
import * as ajv from 'ajv';

let validate = ajv({ allErrors: true, verbose: true }).validateSchema(testx);

console.log('Validation result is ' + validate);
console.log('got validation errors text ' + ajv().errorsText());

```

**Validation result, data AFTER validation, error messages:**

Note, that I correctly get a false validation status but I unexpectedly also get no error texts.

```
LOG: 'Validation result is false'
LOG: 'got validation errors text No errors'

```

**What results did you expect?**
validate to be false, and ajv().errorsText() to return some text description of the errors.

**Are you going to resolve the issue?**
No.
