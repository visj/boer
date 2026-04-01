# [144] Warn about non json-schema object

The following code returns true. I would expect to get an error on this by default.

```
var Validator = require('ajv');
var validator = Validator();
var validate = validator.compile({ 'yahooo': 'blaaaa' });
var isValid = validate({ 'blabla': 'bla' });
// isValid -> true
```
