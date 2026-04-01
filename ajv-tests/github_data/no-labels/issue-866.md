# [866] "Can't resolve reference" when using nested $ref

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

`6.5.4`

**Ajv options object**

```javascript
{
  allErrors: true
}
```


**JSON Schema**

```json
{
  "$id": "http://example.com/example.json",
  "type": "object",
  "definitions": {
    "datetime": {
      "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T ?[0-9]{2}:[0-9]{2}:[0-9]{2}(Z|[+-][0-9]{4})?$",
      "type": "string",
      "examples": [
        "2017-07-18T00:00:00Z"
      ]
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#",
  "properties": {
    "request": {
      "$id": "/properties/request",
      "type": "object",
      "properties": {
        "date": {
          "$ref": "#/definitions/datetime",
          "title": "date",
          "default": ""
        }
      }
    }
  }
}
```

**Sample data**

```json
{
  "request": {
    "date": "2018-05-03T00:00:00Z"
  }
}
```


**Your code**

```javascript
const ajv = new Ajv({
  allErrors: true
});
ajv.validate(definition, data);
```


**Validation result, data AFTER validation, error messages**

```
can't resolve reference #/definitions/datetime from id http://example.com/properties/request
```

**What results did you expect?**

When using the [ajv-cli](https://github.com/jessedc/ajv-cli) library (`ajv validate -s def.json -d data.json`), it works and says the data is valid, but when using the node package it gives the error as shown above

**Are you going to resolve the issue?**

not sure what to do, is it a config issue?