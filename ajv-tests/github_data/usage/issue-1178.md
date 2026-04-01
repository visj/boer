# [1178] additionalProperties: false has no effect

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

  "version": "6.12.0"

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
const options = {
  v5: true,
  allErrors: true,
  additionalProperties: false,
}
```


**JSON Schema**

```json
const schema =
{
    "type": "object",
    "required": [
      "givenName",
      "familyName"
    ],
    "properties": {
      "givenName": {
        "type": "string"
      },
      "familyName": {
        "type": "string"
      }
    }
  }

```


**Sample data**

```javascript
const test_user = {
  givenName: "Bla",
  familyName: "Bla",
  thisShouldFail: "but it will not"
}
```


**Your code**

```javascript
var Ajv = require('ajv');
var ajv = new Ajv(options);

var validate = ajv.compile(schema);
var valid = validate(test_user);
console.log(valid);
```

**Validation result, data AFTER validation, error messages**

```
true
```

**What results did you expect?**

```
false
```

**Are you going to resolve the issue?**

Hopefully I am just doing something wrong.
