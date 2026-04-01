# [2412] OneOf validation issue

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
ajv: "8.12.0"
**Ajv options object**
```javascript
  const ajv = new Ajv({
    allErrors: true,
    multipleOfPrecision: 1,
  });
```

**JSON Schema**
```javascript
const eventSchema = {
  type: 'object',
  properties: {
    oneProperty: {
      oneOf: [
        {
          type: 'object',
          properties: {
            absolute: {
              type: 'number',
              minimum: 1,
              maximum: 16,
              multipleOf: 1,
            },
          },
        },
        {
          type: 'object',
          properties: {
            relative: {
              type: 'number',
              minimum: -8,
              maximum: 8,
              multipleOf: 1,
            },
          },
        },
      ],
    },
  },
  required: ['oneProperty'],
};
```

**Sample data**
```json
{
    "oneProperty": {
        "absolute": "-1"
    }
}
```

**Your code**

```javascript
const validateRequestParams = (
  requestParams,
  eventSchema
) => {
  const ajv = new Ajv({
    allErrors: true,
    multipleOfPrecision: 1,
  });
  const validate = ajv.compile(eventSchema);
  const valid = validate(requestParams ?? {});
  if (!valid) {
    return false;
  }
  return true;
};
```

**Validation result, data AFTER validation, error messages**
true

**What results did you expect?**
false
