# [2248] Browser page freezes when validate a value against a regular expression

validated value (text): 
```javascript
xn-b1afk4ade4e.xnb1ab2a0a.xnb1aew.xn-p1ai/info-service.htm?sid=2000
```
condition:
```json
{
    "pattern": "^(([a-z0-9.-]+)(,|,\\s)?)+$"
}
```
example code:
```javascript
const text = "xn-b1afk4ade4e.xnb1ab2a0a.xnb1aew.xn-p1ai/info-service.htm?sid=2000"
const condition = {
    "pattern": "^(([a-z0-9.-]+)(,|,\\s)?)+$"
}

const validator = (schema) => {
    const validate = ajv.compile(schema);
    return (model) => {
        if (!validate(model)) return validate.errors;
   };
}

const validate = validator(condition);

const error = validate(text); // here the code execution hangs
```