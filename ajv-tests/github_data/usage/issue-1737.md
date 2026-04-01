# [1737] support nullable as sibling to allOf 


**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.6.2

**Ajv options object**
```javascript
{ allErrors: true, strict: false }
```

**JSON Schema**
```json
{
  "type": "object",
  "properties": {
    "myObject": {
      "$ref": "#/components/schemas/MyObject"
    }
  },
  "components": {
    "schemas": {
      "MyObject": {
        "type": "object",
        "properties": {
          "property1": {
            "nullable": true,
            "allOf": [
              {
                "$ref": "#/components/schemas/Wrapper",
              }
            ]
          }
        }
      },
      "Wrapper": {
        "$ref": "#/components/schemas/UnmutableExternalReference"
      },
      "UnmutableExternalReference": {
        "type": "object",
        "properties": {
          "foo": {
            "type": "boolean"
          }
        }
      }
    }
  }
}
```

**Sample data**
```json
{
    "myObject": {
      "property1": null
    }
  }
```

**Your code**
https://runkit.com/crizo23/611ac92f1f015f001ab95cba


**Validation result, data AFTER validation, error messages**

```
Error: "nullable" cannot be used without "type"
```

**What results did you expect?**
validation to pass

**Are you going to resolve the issue?**
no