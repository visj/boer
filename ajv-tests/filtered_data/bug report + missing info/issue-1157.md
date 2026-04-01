# [1157] Enum object validation regression in 6.11.0

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Version: `6.11.0`


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
  const ajv = new Ajv({
    jsonPointers: true,
    allErrors: true,
    formats: {
      color: '^#[0-9a-fA-F]{3,6}$',
      slug: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
      extension: '^\\.[a-zA-Z0-9*]+$',
      alphanumeric: '^[a-zA-Z0-9_\\-]+$',
    },
  });
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$id": "ajv-test",
  "type": "object",
  "properties": {
    "object_enum": {
      "title": "Validate Object in Enum",
      "type": "object",
      "enum": [
        { "text": "Test 1", "value": "test1" }
      ]
    }
  }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
  "object_enum": {
    "text": "Test 1",
    "value": "test1"
  }
}
```


**Validation result, data AFTER validation, error messages**

```
  {
    "keyword": "enum",
    "dataPath": "/object_enum",
    "schemaPath": "#/properties/object_enum/enum",
    "params": {
      "allowedValues": [
        {
          "text": "Test 1",
          "value": "test1"
        }
      ]
    },
    "message": "should be equal to one of the allowed values"
  }
```

**What results did you expect?**

Version `6.10.2` had no validation errors with the same schema and sample data.
