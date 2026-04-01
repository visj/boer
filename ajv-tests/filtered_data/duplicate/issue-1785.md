# [1785] anyOf with required cannot find props in object's properties

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.6.3

**Ajv options object**

```javascript
{
      strict: true,
      allErrors: true,
      removeAdditional: 'all',
      allowUnionTypes: true,
      coerceTypes: true,
      verbose: true,
}
```

**JSON Schema**

```json
        {
          "type": "object",
          "properties": {
            "args": {
              "type": "object",
              "properties": {
                "siteOwner": {
                  "type": "string"
                },
                "siteAdmin": {
                  "type": "string"
                }
              },
              "anyOf": [
                { "required": ["siteOwner"] },
                { "required": ["siteAdmin"] }
              ]
            },
          }
        }
```

**Sample data**

```json
     {
        "args": {
          "siteOwner": "value"
        }
      }
```

**Your code**

```javascript
      const ajv = new Ajv({
        strict: true,
        allErrors: true,
        removeAdditional: 'all',
        allowUnionTypes: true,
        coerceTypes: true,
      });
      const validate = ajv.compile(
        {
          "type": "object",
          "properties": {
            "args": {
              "type": "object",
              "properties": {
                "siteOwner": {
                  "type": "string"
                },
                "siteAdmin": {
                  "type": "string"
                }
              },
              "anyOf": [
                { "required": ["siteOwner"] },
                { "required": ["siteAdmin"] }
              ]
            },
          }
        }
      );
```

**Validation result, data AFTER validation, error messages**

```
Error: strict mode: required property "siteOwner" is not defined at "#/properties/args/anyOf/0" (strictRequired)
src/start.ts:196
```

**What results did you expect?**
I expect that the schema compilation finds the property 'siteOwner' which is declared in the 'properties' section in the schema.
If I remove the anyOf and have only one required field, the compilation passes successfully.

**Are you going to resolve the issue?**
Depending on the language and the ramp-up time.