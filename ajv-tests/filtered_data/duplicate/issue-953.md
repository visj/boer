# [953] Validate date properly

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
I am using AJV version 6.9.1. I can also see this issue in version 6.0.0

**JSON Schema**
```json
{
    "properties": {
        "birth-date": {
            "type": "string",
            "format": "date"
        }
    }
}

```

**Sample data**
```json
{
    "birth-date": "2019-13-39"
}

```

**Your code**

```javascript
var Ajv = require('ajv');
var ajv = new Ajv({
    allErrors: true
})
var validate = ajv.compile(schema);
var valid = validate(data);
if (!valid) console.log(validate.errors);


```


**Validation result, data AFTER validation, error messages**

```
No Error. Which is wrong because "2019-13-42" is not a valid date. Month can't be 13 and day can't be 39.  

```

**What results did you expect?**
```json
{
    "keyword": "format",
    "dataPath": "['birth-date']",
    "schemaPath": "#/properties/birth-date/format",
    "params": { "format": "date" },
    "message": "should match format date" 
}
```