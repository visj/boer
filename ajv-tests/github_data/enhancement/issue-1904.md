# [1904] Create schema  from a json object

Hey can the library support creating the schema from a json object 

Example

```
 const JSONEXAMPLE = {
    "checked": false,
    "dimensions": {
        "width": 5,
        "height": 10
    },
    "id": 1,
    "name": "A green door",
    "price": 12.5,
    "tags": [
        "home",
        "green"
    ]
}
```

and some function like `ajv.createSchema(JSONEXAMPLE)` 

if there is any please point towards the right direction other wise can you add this feature ?