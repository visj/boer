# [1004] Retrieve additional properties keys and values

Hello,

Is there an easy way to retrieve additional properties ?

```javascript
const Ajv = require('ajv');
const ajv = new Ajv();

const schema = {
    "properties": {
        "property1": {
            "type": "string"
        },
        "property2": {
            "type": "number"
        }
    },
    "additionalProperties": true
}

const data = {
    "property1": "Hello!",
    "property2": 15,
    "property3": "This is an additional property"
}

let validate = ajv.compile(schema)
let valid = validate(data)
```

Can I validate this data, then somehow obtain key & values of additional properties ?

Thanks !
