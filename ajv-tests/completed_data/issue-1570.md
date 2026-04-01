# [1570] Throwing error on validation instead of collecting errors on validator instance

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Porting from 6 to 8.1.0

**Ajv options object**

```javascript
{
  allErrors: true,
  verbose: true,
}
```

**JSON Schema**

```json
{
  "type": "object",
  "properties": {
    "date": {
      "oneOf": [
        {
          "type": "text",
          "format": "date-time"
        },
        {
          "type": "text",
          "format": "date"
        }
      ]
    }
  }
}
```

**Sample data**

```json
{
  "date": "2021-04-26"
}
```

**Your code**

```javascript
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const testValidator = new Ajv({
  allErrors: true,
  verbose: true,
});
addFormats(testValidator);

const testValid = testValidator.validate(
  {
    type: "object",
    properties: {
      date: {
        oneOf: [
          {
            type: "text",
            format: "date-time",
          },
          {
            type: "text",
            format: "date",
          },
        ],
      },
    },
  },
  {
    date: "2021-04-26",
  }
);
```

**Validation result, data AFTER validation, error messages**

```
Error: schema is invalid:
data/properties/date/oneOf/0/type must be equal to one of the allowed values,
data/properties/date/oneOf/0/type must be array,
data/properties/date/oneOf/0/type must match a schema in anyOf,
data/properties/date/oneOf/1/type must be equal to one of the allowed values,
data/properties/date/oneOf/1/type must be array,
data/properties/date/oneOf/1/type must match a schema in anyOf
```

**What results did you expect?**

In previous version (6) the errors would be collected at `testValidator.errors` of which I could also test value of `testValid` to know if the data did not validate against the schema. In fact, this is what it specifies in all the current online documentation as well.

**Are you going to resolve the issue?**

I assume it's an issue with AJV since it worked with version 6 before. Maybe it's related to all the new strict rules?

I'm unsure if this is a schema issue (using `oneOf` with multiple schemas with the different date formats), because when I change the schema to remove the `oneOf` I still get errors:

```javascript
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const testValidator = new Ajv({
  allErrors: true,
  verbose: true,
});
addFormats(testValidator);

const testValid = testValidator.validate(
  {
    type: "object",
    properties: {
      date: {
        type: "text",
        format: "date",
      },
    },
  },
  {
    date: "2021-04-26",
  }
);
```

```
schema is invalid: data/properties/date/type must be equal to one of the allowed values,
data/properties/date/type must be array,
data/properties/date/type must match a schema in anyOf
```