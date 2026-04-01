# [1034] { "not": {}} schema validation

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.10.0

**Ajv options object**

```javascript
{ allErrors: true }
```

**JSON Schema**

```json
{"not": {}}
```


**Sample data**

```json
undefined
```

**Your code**

```javascript
var Ajv = require('ajv');
var ajv = new Ajv({ allErrors: true }); // options can be passed, e.g. {allErrors: true}
var validate = ajv.compile({ "not": {} });
var valid = validate(undefined);
if (!valid) console.log(validate.errors);
```

**Validation result, data AFTER validation, error messages**

```
[ { keyword: 'not',
        dataPath: '',
        schemaPath: '#/not',
        params: {},
        message: 'should NOT be valid' } ]
```

**What results did you expect?**
I expect that it's considered as correct.

**Are you going to resolve the issue?**
Not for now.