# [728] Required validation for object in AJV doesn't work with empty value {}

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
Latest version of AJV - 6.2.0

I'm using AJV for validating JSON schemas. I have a property of type object where certain fields are required. In below schema, name and email properties are required for person object. The validation works fine if one of name or email has a value. But when the object is empty {} it doesn't call it invalid and throw an error that I'd expect it to.

**AJV Options**

```js
ajvOptions: any = { allErrors: true, jsonPointers: true, unknownFormats: 'ignore' };
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "schema": {
    "type": "object",
    "properties": {
      "person": { 
        "type": "object",
        "required":["name", "email"],
        "properties": {
          "name": { "type": "string", "minLength": 1, "required": true },
          "email": { "type": "string","minLength": 1, "required": true }
        }
      }
    }
  }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{}
```

**Validation result, data AFTER validation, error messages**

When there's no data for this object set, it accepts the value and treats it as a valid form. 


**What results did you expect?**

I expected it to to throw required fields error as mentioned in documentation [here](https://epoberezkin.github.io/ajv/keywords.html#keywords-for-objects) which says {} is invalid.
