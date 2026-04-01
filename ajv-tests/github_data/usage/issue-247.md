# [247] Multiple schema errors not reported at once

Using `ajv.validate(instance, schema);` with the following values, gives me only a single validation error when I would expect two.  

INSTANCE: `{"x":1,"y":1}`

SCHEMA:

```
      {
       "properties": {
        "x": {
         "type": "string"
        },
        "y": {
         "type": "string"
        }
       }
      }
```

I get only the following single error in `ajv.errors` using either `ajv.errors` or `ajv.errorsText()`

`'.x should be string'`

I expect something like:

`'.x should be string','.y should be string'`      
