# [1784] First schema eval in anyOf removed props when removeAdditional = 'all' before checking the second schema

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
              "anyOf": [
                {
                  "properties": {
                    "Fn": {
                      "type": "string"
                    }
                  },
                  "required": ["Fn"]
                },
                {
                  "properties": {
                    "siteOwner": {
                      "type": "string"
                    }
                  },
                  "required": ["siteOwner"]
                },
              ]
            }
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
              "anyOf": [
                {
                  "properties": {
                    "Fn": {
                      "type": "string"
                    }
                  },
                  "required": ["Fn"]
                },
                {
                  "properties": {
                    "siteOwner": {
                      "type": "string"
                    }
                  },
                  "required": ["siteOwner"]
                },
              ]
            }
          }
        }
      );
      const result = validate({
        "args": {
          "siteOwner": "value"
        }
      });
      if (result) {
        console.log('Okay');
      } else {
        console.error(JSON.stringify(validate.errors, null, 2));
      }
```

**Validation result, data AFTER validation, error messages**

```
[
  {
    "instancePath": "/args",
    "schemaPath": "#/properties/args/anyOf/0/required",
    "keyword": "required",
    "params": {
      "missingProperty": "Fn"
    },
    "message": "must have required property 'Fn'"
  },
  {
    "instancePath": "/args",
    "schemaPath": "#/properties/args/anyOf/1/required",
    "keyword": "required",
    "params": {
      "missingProperty": "siteOwner"
    },
    "message": "must have required property 'siteOwner'"
  },
  {
    "instancePath": "/args",
    "schemaPath": "#/properties/args/anyOf",
    "keyword": "anyOf",
    "params": {},
    "message": "must match a schema in anyOf"
  }
]
```

**What results did you expect?**
I expected that the second schema in anyOf matches the data successfully.
If I reverse the schemas in the anyOf array, it works.
I also works if I set 'removeAdditional' to 'false'

**Are you going to resolve the issue?**
Depending on the language and the ramp-up time.