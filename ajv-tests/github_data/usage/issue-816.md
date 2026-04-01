# [816] Pseudo error of missing required property.

### schema is invalid: data should have required property 'version', but version does exist.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.5.2

**JSON Schema**

```json
{
  "$id": "http://json-schema.org/draft-06/schema#",
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "com.schema.example",
  "type": "object",
  "properties": {
    "version": {
      "title": "Version",
      "description": "File version.",
      "type": "string",
      "enum": ["1.0"]
    },
    "list": {
      "title": "List",
      "description": "Just a list.",
      "type": "array",
      "items": {
        "$ref": "#/definitions/List"
      }
    }
  },
  "required": ["version"],
  "definitions": {
    "List": {
      "type": "object",
      "properties": {
        "name": {
          "title": "Name",
          "description": "Just a name.",
          "type": "string"
        },
        "value": {
          "title": "Value",
          "description": "Just a value.",
          "type": "number"
        }
      },
      "required": ["name", "value"]
    }
  }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
  "$schema": "./my-example.schema.json",
  "version": "1.0",
  "list": [{
    "name": "First item",
    "value": 123
  }, {
    "name": "Seconds item",
    "value": 456
  }]
}
```


**Your code**
Snippet of a async-function in typescript. 
`http` comes from `import { HttpClient } from '@angular/common/http';` and `get` returns a json object in this case.

```typescript
// Load
const config = await this.http.get('assets/data.json').toPromise();
const schema = await this.http.get('assets/data.schema.json').toPromise();

// Validate (important code)
const ajv = new Ajv();
const validate = ajv.compile(schema);
const valid = validate(config);

console.log(valid, validate.errors);
```


**Validation result, data AFTER validation, error messages**

```
schema is invalid: data should have required property 'version'
```

**What results did you expect?**
`version` exists. What's the problem? It should work. VS Code and online validators validates this successfully to valid. The `required` field for the items of the list property works in ajv.
Also if I change `enum` by `const`, `required: ["version"]` does not work with ajv.

**Are you going to resolve the issue?**
When I remove the `required` property from the schema for the `version` property, it works.

**Setup**
Using ajv in typescript on ionic (angular).