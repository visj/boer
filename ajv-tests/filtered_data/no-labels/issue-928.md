# [928] multipleOf precision not working with 2 decimals 

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.7.0

**Ajv options object**
```javascript
{
  allErrors: true
}
```

**JSON Schema**
```json
{
  "type": "number",
  "multipleOf": 0.01
}
```

**Sample data**
```json
19.99
```

**Your code**

```javascript
var Ajv = require('ajv');

var options = {
  allErrors: true
};

var schema = {
  "type": "number",
  "multipleOf": 0.01
};

var data = 19.99

var ajv = new Ajv(options);
var validate = ajv.compile(schema);
var valid = validate(data);
if (valid) console.log('Valid!');
else console.log('Invalid: ' + ajv.errorsText(validate.errors));
```
_**Notebook**_
[https://runkit.com/embed/wm1yvzyklqy8](https://runkit.com/embed/wm1yvzyklqy8)


**Validation result, data AFTER validation, error messages**

```
"Invalid: data should be multiple of 0.01"
```

**What results did you expect?**
```
Valid!
```

**Are you going to resolve the issue?**
No
