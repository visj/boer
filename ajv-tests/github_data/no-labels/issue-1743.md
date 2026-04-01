# [1743] Check Strict Tuple

version 8.6.2

schema
```json
{
  "type": "object",
  "properties": {
        "sensors": {
            "type": "array",
            "minItems": 1,
            "maxItems": 5,
            "additionalItems": false,
            "items": [ {"type": "string"}, {"type": "number"}, {"type": "string"}, {"type": "number"}, {"type": "string"}]
       }
   }
}
```

data
```
{sensors: ["one"]}
```

I get a warning that i don't understand

```
strict mode: "items" is 5-tuple, but minItems or maxItems/additionalItems are not specified or different at path "#/properties/sensors"
```

could there be a mistake?

https://github.com/ajv-validator/ajv/blob/cf8d31f007f4bbb4f5a1d02ee4c636921caf6cd8/lib/vocabularies/applicator/items.ts#L51

