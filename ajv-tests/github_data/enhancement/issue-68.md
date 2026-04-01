# [68] dataPath is empty for dependencies

Hi there) 
I have some simple schema, let's say

``` javascript
var schema = {
  "type": "object",
  "properties": {
    "description": {
       "type": "string"
    },
    "email" : {
      "format": "email"
    },
  "dependencies": {
    "description": ["email"]
  }
};
```

And the data to be validated

``` javascript
var data = { description: "dfd"};
```

The result of the validation is 

``` javascript
{
  dataPath: ""
  keyword: "dependencies"
  message: "should have property email when property description is present"
}
```

I need dataPath to be able to associate error with some property and highlight component in UI.

Thanks.
