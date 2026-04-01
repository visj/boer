# [137] Isn't "type" an allowed property name ?

In this schema:

``` json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "effects",
  "type": "array",
  "uniqueItems": true,
  "items" : {
    "title": "effect",
    "type": "object",
    "properties": {
      "id": {
        "description": "The unique identifier for an effect",
        "type": "integer",
        "minimum": 0
      },
      "displayName": {
        "description": "The display name of an effect",
        "type": "string"
      },
      "name": {
        "description": "The name of an effect",
        "type": "string",
        "pattern": "\\S+"
      },
      "type": {
        "description": "Whether an effect is positive or negative",
        "type": { "enum": [ "good","bad" ] }
      }
    },
    "required": ["id", "displayName", "type", "name"],
    "additionalProperties":false
  }
}
```

I'm getting 

```
Error: schema is invalid:data.items.properties['type'].type should be equal to one of the allowed values, data.items.properties['type'].type should be array, data.items.properties['type'].type should match some schema in anyOf, data.items should be array, data.items should match some schema in anyOf
```

I don't understand why.

Is it really forbidden to have object with a property named "type" ?

(I'm not getting any error for this with the jsonschema package)
