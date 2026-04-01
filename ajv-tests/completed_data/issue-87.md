# [87] Unable to validate property that consists of single "$" sign

If I use the following schema:

```
var schema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type": "object",
    "additionalProperties": false,
    "properties": 
    {
        "$": 
        {
            "type": "string"
        }
    },
    "required": 
    [
        "$"
    ]
};
```

and try to validate this object: 

```
{$: 'Client'}
```

It will fail saying that "Invalid: data.$ should be string".

If I change $ to for example $a validation run without errors.
