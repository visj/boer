# [469] Duplicate error with "coerceTypes" option

There seems to be an issue with unsupported formats.  I don't have control over what's passed in as a format for certain types in the json schema.  I tried ignoring them (`unknownFormats: 'ignore'`) and adding them (`addFormat`) as described below.  I always end up getting duplicate error messages for the same fields.  If I remove the format keyword in the schema, the problem disappears.
Any clue?

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
5.0.0


**Ajv options object**
```javascript
const ajv = new Ajv({
    removeAdditional: true,
    // unknownFormats: 'ignore',
    coerceTypes: 'array',
    allErrors: true,
    verbose: true,
});
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "number",
  "format": "double",
  "description": ""
}
```


**Sample data**

```json
'lorem'
```


**Your code**

```javascript
const ajv = new Ajv({
    removeAdditional: true,
    // unknownFormats: 'ignore',
    coerceTypes: 'array',
    allErrors: true,
    verbose: true,
});

ajv.addFormat('double', /.*/); // double format isn't standard.  Accept anything

const validate = ajv.compile({
  "type": "number",
  "format": "double",
  "description": ""
});

validate('lorem');
logger.error({ ajv: validate.errors });
```

**Validation result, data AFTER validation, error messages**

```
 [
      {
        "keyword": "type",
        "dataPath": "",
        "schemaPath": "#/type",
        "params": {
          "type": "number"
        },
        "message": "should be number",
        "schema": "number",
        "parentSchema": {
          "type": "number",
          "format": "double",
          "description": ""
        },
        "data": "lorem"
      },
      {
        "keyword": "type",
        "dataPath": "",
        "schemaPath": "#/type",
        "params": {
          "type": "number"
        },
        "message": "should be number",
        "schema": "number",
        "parentSchema": {
          "type": "number",
          "format": "double",
          "description": ""
        },
        "data": "lorem"
      }
    ]
```

**What results did you expect?**
```
 [
      {
        "keyword": "type",
        "dataPath": "",
        "schemaPath": "#/type",
        "params": {
          "type": "number"
        },
        "message": "should be number",
        "schema": "number",
        "parentSchema": {
          "type": "number",
          "format": "double",
          "description": ""
        },
        "data": "lorem"
      }
    ]
```

