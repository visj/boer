# [1764] Incorrect behaviour with `prefixItems`



**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.6.3

**Ajv options object**


```javascript
{allErrors: true, strict: false}
```

**JSON Schema**


```json
{
  type: "array",
  prefixItems: [{type: "integer"}, {type: "integer"}],
  minItems: 2,
}

```

**Sample data**


```json
["a","b"]

```

**Your code**



```javascript
const Ajv = require("ajv")
const ajv = new Ajv({allErrors: true, strict: false})

var s = {
  type: "array",
  prefixItems: [{type: "integer"}, {type: "integer"}],
  minItems: 2,
};

ajv.validate(s, ["a","b"])


```

**Validation result, data AFTER validation, error messages**

```
true

```

**What results did you expect?**

false

**Are you going to resolve the issue?**
No
