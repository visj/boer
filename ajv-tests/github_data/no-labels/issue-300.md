# [300] Removing failing properties with removeAdditional=failing

Hi,
I was looking into delegating some data cleaning to ajv using removeAdditional, for example, remove empty strings or other failing optional properties from objects. Straight up defining those optional properties in object's `properties` and running with `removeAdditional: 'failing'` doesn't seem to do the trick: validation just fails. I'm wondering if I misunderstood the concept and whether there is another way to achieve this result with ajv by refactoring the schema.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
4.7.0

**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

``` javascript
  useDefaults: true,
  removeAdditional: 'failing',
  coerceTypes: true,
```

**JSON Schema (please make it as small as possible to reproduce the issue):**

``` json
{
    "type": "object",
    "properties": {
        "_id": {
            "type": "string"
        },
        "optionalString": {
            "type": "string",
            "minLength": 5
        },
        "optionalObject": {
            "type": "object",
            "minProperties": 1
        }
    },
    "additionalProperties": false,
    "required": ["_id"]
}
```

**Data (please make it as small as posssible to reproduce the issue):**

``` json
{
    "_id": "someid",
    "optionalString": "1",
    "optionalObject": {
        "a": "b"
    },
    "randomOption": true
}
```

**Your code (please use `options`, `schema` and `data` as variables):**

ajv -s schema.json -d data.json --changes --remove-additional failing

**Validation result, data AFTER validation, error messages:**
# /properties/optionalString/minLength should NOT be shorter than 5 characters

**What results did you expect?**

Removal of optionalString as a failing property without invalidating the object.
