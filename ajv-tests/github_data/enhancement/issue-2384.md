# [2384] Contains object property with unknown key matching a schema

Is it possible to validate an object schema requiring to have at least one property with an unknown key matching a given sub-schema like following:

```jsonc
{
    "type": "object",
    "additionalProperties":  {
          "contains": {
                 "type": "string"
          }
    }
}
```
where:

```jsonc
{"prop2": 3}   // not valid
{"prop1": "value1", "prop2": 3}   // valid
```