# [1081] coerce items in array

coerce items in array

**example**
```js
{
    "type":"object", 
    "properties":{
        "list":{
           "type":"array",
            "items":{ "type":"string" } 
        }
    }
}
```
**input**
```
{
    "list":[1, 2, 3]
}
```
**expected output:**
```
{
    "list":["1", "2", "3"]
}
```

Is this possible to achieve?