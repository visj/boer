# [505] Cannot load local $ref definitions

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
5.1.3

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "id": "Sometypes",
  "type": "object",
  "definitions": {
    "uuid": {
      "type": "string",
      "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
    }
  }
}

{
    "id": "Animal",
    "type": "object",
    "properties": {
        "uid": {
            "$ref": "Sometypes#/definitions/uuid"
        },
    }
}
```

**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
const schema: any = require(filePath);
ajv.addSchema(schema);

ajv.validate('Animal', { uuid: '68208874-fdcb-4d9a-b9ee-cbbdc8cb7c4c'});
```


**Validation result, data AFTER validation, error messages**

```
Error: Reference not found: http://json-schema.org/Sometypes#/definitions/uuid

```

**What results did you expect?**
Expected to see that this validates, but it seems that the reference isn't finding our definitions for uuid.  Both of the json files are being passed through addSchema. 

