# [1008] Validation fails for integer field values starting with 0

JSON schema validation fails for the integer fields starting with 0 or 00 or 0000....

AJV version **6.10.0**



```const schema = {
  type: "object",
 properties: {
value: {
type: "integer"
}
}
}
```

Schema validation for integer value fails when the value is 
```json
{
value: 0100
}

```

