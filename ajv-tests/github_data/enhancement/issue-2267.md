# [2267] Validate object containing object for uniqueness

Hi,

I have the example like below,
```
"obj2": 
{
    {
      "prop1": "baz", "prop2": 999
     },
    {
      "prop1": "qux", "prop2": 555
     }
 }
```

i.e object containing objects, now in this i need '**_prop1_**' field to have unique values. 

**_Note:_**:  I know this is possible when it is array of object, but i dont think there is any solution for the same case when object containing objects.
