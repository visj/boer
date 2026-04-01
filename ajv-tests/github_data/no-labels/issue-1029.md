# [1029] Inconsistent dataPath for errors

I'm trying to get the respective field(s) for all errors found. I would prefer an object with the errors However, I can work with transforming the error array into an error object but there isn't a consistent error field indicating what field(s) is causing the error. For keyword error's required, its params.missingProperty while keyword error's type, its dataPath.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.10

**example**
```
var Ajv = require('ajv');
var ajv = new Ajv({allErrors: true});

var schema = {
    "title":"common",
    "properties": {
        "foo": { "type": "string" },
        "bar": { "type": "number", "maximum": 3 }
    },
    "required": ["bar"]
};

var validate = ajv.compile(schema);

// test({"foo": "abc", "bar": 2});
test({"foo": "2"});
test({"bar": "2"});
function test(data) {
  var valid = validate(data);
  if (valid) console.log('Valid!');
  else console.log(validate.errors);
}
```

**Validation result, data AFTER validation, error messages**

```
[Object {dataPath: "", keyword: "required", message: "should have required property 'bar'", …}]
[Object {dataPath: ".bar", keyword: "type", message: "should be number", params: Object {type: "number"}, …}]
```

**What results did you expect?**
```
[Object {dataPath: ".bar", keyword: "required", message: "should have required property 'bar'", …}]
[Object {dataPath: ".bar", keyword: "type", message: "should be number", params: Object {type: "number"}, …}]
```

**Are you going to resolve the issue?**
I'm probably missing something very simple. I'm just not sure why there isn't a consistent field indicating what field is causing the error. I tried verbose option to no avail. Before I take into consideration the error keyword in order to display the error next to faulty field, I want to make sure I didn't misunderstand ajv's error array usage.