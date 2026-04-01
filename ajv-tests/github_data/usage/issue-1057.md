# [1057] Error: unknown format ""  is used in schema at path 

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports. For other issues please use:
- security vulnerability: https://tidelift.com/security)
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.0.0.

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

https://github.com/F5Networks/f5-appsvcs-extension/blob/master/schema/latest/as3-schema.json


**Sample data**

```json
{
    "foo": 12345,
    "bar": "a"
}
```


**Code**
```javascript

const schema = require('./schema.json')
const payload = require('./test.json')
var ajv = new Ajv();
var validate = ajv.compile(schema);

test(payload);

function test(data) {
  var valid = validate(data);
  if (valid) console.log('Valid!');
  else console.log('Invalid: ' + ajv.errorsText(validate.errors));
}


```
**Validation result, data AFTER validation, error messages**

```

Error: unknown format "f5bigip" is used in schema at path "#/definitions/Basic_Persist/else/properties/bigip"

```


**What results did you expect?**
For it to give an error for the sample data