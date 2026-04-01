# [1118] Validation - Type "Integer"

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.10.2

**JSON Schema**



```json

var schema = {
  "properties": {
    "foo": { "type": "integer" }
  }
};
```


**Sample data**

```json

test({"foo":1.0, "bar": 2});
```


**Validation result, data AFTER validation, error messages**

```

No errors
```

**What results did you expect?**
Invalid: data.foo should be integer

**Are you going to resolve the issue?**
Should this be considered as an issue?
Value 1.0 gets type casted to integer 1. Is it expected?
Value 1.1 returns the expected error "Invalid: data.foo should be integer"