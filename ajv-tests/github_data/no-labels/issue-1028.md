# [1028] $data doesn't appear to work. :(

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.10.0


**Ajv options object**
```javascript
var ajv = new Ajv({allErrors: true, $data: true});
```


**JSON Schema**

```json
 {
  "properties": {
        "startDate": { "type": "string", "format": "date"},
        "endDate": { "type": "string", "format": "date",
            "formatMinimum": {"$data": "/startDate"},
        }
    }
}
```


**Sample data**
```json
{ "startDate": "2008-09-01", "endDate": "2004-09-01"}
```

**Your code**
```javascript
var validate = ajv.compile(schema);

test({startDate:"2008-09-01", endDate: "2004-09-01"});

function test(data) {
  var valid = validate(data);
  if (valid) console.log("Valid!");
  else console.log("Invalid: " + ajv.errorsText(validate.errors));
}
```
See running code at https://runkit.com/jcdietrich/5d0bda8577a13a001a8f08c6
Note: I have tried 0/startDate 1/startDate 2/startDate as well as /startDate

**Validation result, data AFTER validation, error messages**
```
Valid!
```

**What results did you expect?**
Invalid: ...

**Are you going to resolve the issue?**
I would like help please...