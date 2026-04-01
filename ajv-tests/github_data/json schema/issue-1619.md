# [1619] Validating particular index objects inside an array of objects

```
schema: {
    type: "array",
    items: {
      type: "object",
      properties: {
         field1: { type: "string" },
         field2: { type: "string" }
       },
      required: [ "field2" ]
  }
}
```

```
data : [ 
  { field1: "value1", field2: "value2" },
  { field1: "value1" },
]
```

Above is the schema and the data.
Here I want to validate "required" field for only first index in array. 
                          OR
I want to run validator for particular specific indexs. Is there any way to do this in avj ?