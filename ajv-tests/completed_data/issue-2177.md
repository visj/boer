# [2177] Ajv fails to validate schema for Object with "propertyNames" from "enum"

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

latest / 8.11.2

**Ajv options object**

Using defaults

**JSON Schema**
```json
{
    "type": "object",
    "propertyNames": {
        "enum": ["Foo","Bar"]
    },
    "patternProperties": {
        ".*": {
            "type": "number"
        }
    }
}
```
<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "Foo": 123,
    "Bar": 456
}
```
**Your code**

```javascript
    const schema = ajv.addSchema(schema_Test);
    console.log(schema.validate(schema_Test, json_test));
    console.error(schema.errorsText());
```

**Validation result, data AFTER validation, error messages**

```
false
data must be equal to one of the allowed values, data property name must be valid
```

**What results did you expect?**

I expected this to successfully validate. A leading JSON Schema validator for .Net does successfully validate the JSON against the JSON Schema.

**Are you going to resolve the issue?**
No.