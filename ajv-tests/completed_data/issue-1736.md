# [1736] nullable with allOf and $ref yields unexpected results

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
            "$ref": "#/components/schemas/Wrapper"
          }
        }
      },
      "Wrapper": {
        "type": "object",
        "nullable": true,
        "allOf": [{ "$ref": "#/components/schemas/UnmutableExternalReference" }]
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

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
"myObject": {
      "property1": null
    }
}
```

**Your code**

https://runkit.com/crizo23/611ac6cd2da767001a22e806


**Validation result, data AFTER validation, error messages**

```
[{"instancePath":"/myObject/property1","schemaPath":"#/components/schemas/UnmutableExternalReference/type","keyword":"type","params":{"type":"object"},"message":"must be object"}
```

**What results did you expect?**
Expected validation to pass

**Are you going to resolve the issue?**
I wish I could!