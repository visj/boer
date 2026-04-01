# [1339] useDefaults: 'empty' not functional

<!--

-->
Just updated to v7 beta and found a possible issue. I use useDefaults: 'empty' in my schema to replace empty strings and nulls with a default value. That seems to not work for empty strings anymore (this did work well with v6). I do not see anything in the comments or release documentation about useDefaults so I assume it should work in the same way as v6.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
    "ajv": "^7.0.0-beta.9",
    "ajv-formats": "^0.6.1",
    "ajv-keywords": "^4.0.0-beta.3"

**Ajv options object**
```javascript
    const ajv = new Ajv({
      allErrors: true,
      $data: true,
      coerceTypes: true,
      useDefaults: 'empty',
      removeAdditional: true,
      validateFormats: true
    });
    addFormats(ajv);
```
Note: removed format: 'fast' for the new version which does work in other parts of my validation.

Here is the portion of my schema in question:
```javascript
const createSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://validation.alana.plasmatic.ai/communciations/create.json',
  additionalProperties: false,
  type: 'object',
  required: [
   'navigate'
 ],
 properties: {
    navigate: {
      default: 'notGiven'
    }
 },
 allOf: [
    {
      if: { properties: { navigate: { const: 'notGiven' } } },
      then: {},
      else: {properties: { navigate: { type: 'string', format: 'uri' } }}
    }
  ]
 
 }

```


**Sample data**
```json
{
"navigate: ""
}
```

**Validation result, data AFTER validation, error messages**

```
 errors: [
        {
          keyword: 'format',
          dataPath: '/navigate',
          schemaPath: '#/allOf/0/properties/navigate/format',
          params: { format: 'uri' },
          message: 'should match format "uri"'
        }
      ]

```

**What results did you expect?**
I expect that the if/then/else would hit the 'then' statement allowing the default 'notGiven' to pass validation. Since it hits the else statement I assume the default is not being set. If I change the if statement to look for navigate {const: ""} it does go into the else letting the validation pass. However, I need the empty string replaced with my default as well.
```json
{
"navigate": "notGiven"
}

```

**Are you going to resolve the issue?**
No; I am looking for assistance on the issue. TIA! And great enhancements in V7! I'm updating to use the select/selectCases which are going to be a huge improvement for our system.