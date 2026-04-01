# [1072] ajv.errors returns null when used as per Getting Started example.

Using 6.10.2

```
const Ajv = require('ajv');
const ajv = new Ajv();

const schema = {
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "$schema": {
      "type": "string"
    },
    "valid": {
      "type": "boolean"
    }
  }
};

const invalidData = {
  "valid": "false"
};

const validate = ajv.compile(schema);
const valid = validate(invalidData);
console.log(valid); // false
if (!valid) {
  console.log(ajv.errors); // null
}
```

I originally tried with a much more complicated example and I expected some list of errors telling me why the data is not valid but I just get null, even with this most basic example.