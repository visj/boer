# [788] Required fields wrongly reported as missing

With the following schema definition :
 ```
{
    "$schema": "http://json-schema.org/draft-06/schema#",
    "type": "object",
    "properties": {
      "entities": {
        "type": "object"
      }
    },
    "required": ["entities"]
}
```

the schema below is not validated. The error is : **"should have required property 'entities'"**.

```
{
    "entities": {
      "obj": {
        "name": "object1"
      }
    }
}
```