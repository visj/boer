# [221] Error on date-time validation

Hi, 

There is an issue when validating a date-time property. If the data matches the ISO pattern, but defines an invalid date, the validation passes.

For example : 

``` json
{
  "type" : "object",
  "properties" : {
     "start" : {
       "type" : "string",
       "format" : "date-time"
     }
  }
}
```

If I send { "start" : "2016-15-12T00:00:00.123Z" }, The test should fail, but it passes.

BR
Seb
