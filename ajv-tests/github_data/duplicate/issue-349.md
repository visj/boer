# [349] When coerceTypes is true, custom format function was not executed.

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

```javascript
{
    removeAdditional: 'all',
    coerceTypes: true,
    allErrors: true
}
```


**JSON Schema (please make it as small as possible to reproduce the issue):**

```json
{
    "properties": {
      "id": {
        "type": "integer",
        "format": "int32"
      }
    }
  }
```


**Data (please make it as small as posssible to reproduce the issue):**

```json
{
    "id": "1234"
}
```


**Your code (please use `options`, `schema` and `data` as variables):**

```javascript
const Ajv = require('ajv');

function foo() {
  const ajv = new Ajv({
    removeAdditional: 'all',
    coerceTypes: true,
    allErrors: true
  });

  ajv.addFormat('int32', (data)=> {
    data = Number(data);
    console.log('foo int32 ', data)

    if (data <= 2147483647 && data >= -2147483647)
      return true;
    else
      return false;
  });

  const schema = {
    "properties": {
      "id": {
        "type": "integer",
        "format": "int32"
      }
    }
  }

  const data = {
    id: '1234'
  }

  var validate = ajv.compile(schema);
  var ret = validate(data);
  console.log(ret, data, validate.errors);
}

foo();
```

<!--
It would help if you post a working code sample in Tonic notebook and include the link here. You can clone this notebook: https://tonicdev.com/esp/ajv-issue.
-->


**Validation result, data AFTER validation, error messages:**

```
// console.log output
true { id: 1234 } null
```

**What results did you expect?**
valid and *int32* format function was executed.
but *int32* custom function was not executed.

**Are you going to resolve the issue?**
At this moment, I don't know how to resolve it.