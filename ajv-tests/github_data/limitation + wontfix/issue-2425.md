# [2425] `maxLength` constraint checking seems to not code (Hindi) unicode characters properly

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

`8.13.0`

**Ajv options object**

```javascript
ajv = new Ajv({});
```

**JSON Schema**

```json
var schema = {
    type: 'string',
    maxLength: 30,
};
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
var data = "विकी मेड मेडिकल इनसाइक्लोपीडिया हिंदी में";
```

**Your code**

```javascript
console.log(validate(data));
console.log(validate.errors);
```

**Validation result, data AFTER validation, error messages**

```
false
[
  {
    instancePath: '',
    schemaPath: '#/maxLength',
    keyword: 'maxLength',
    params: { limit: 30 },
    message: 'must NOT have more than 30 characters'
  }
]
```

**What results did you expect?**

You can count yourself, the string has only 25 characters, it should pass.

**Are you going to resolve the issue?**

No