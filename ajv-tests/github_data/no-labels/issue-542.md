# [542] Array validation and 'useDefaults: true'

Hello

I am trying to create a schema with a default value for an array and have the validate function "insert"  that in case an empty array object is passed in. It's not working for me, but I am also not sure it is supposed to work.

I tried a few different things. Here is one such an attempt

```javascript
{
    "$schema": "http://json-schema.org/draft-06/schema",
    "type" : "array",
    "minItems" : 1,
    "default" : [{"name" : "FruitCalories", "values" : [{"x":"Apple","y":49},{"x":"Banana","y":95},{"x":"Pear","y":37},{"x":"Orange","y":37}]}],
    "items" : {
        "type" : "object",
        "required" : ["name","values"],
        "properties" : {
            "name": {
                "type": "string"
            },
            "values": {
                "type": "array",
                "minLength" : 1,
                "items": {
                    "type": "object",
                    "required" : ["x","y"],
                    "properties": {
                        "x": {
                            "$id": "x",
                            "type" : ["string","number"]
                        },
                        "y": {
                            "$id": "y",
                            "type": "number"
                        }
                    }
                }
            }
        }
    }
}
```

I guess first question I have is, whether having a schema that when asked to validate [] will return some default array, is supposed to work? If so any tips / examples?

Many thanks!

Peter