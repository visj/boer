# [607] ISODate format and type

Hi,
My schema is as below
```
var schema = {
  'type': 'object',
  'additionalProperties': false,
  'properties': {
    'firstName': {'type': 'string'},
    'age': {'type': 'integer'},
    'dateofBirth': {'type': 'Date', 'format': 'date'}
  },
  'required': [ 'firstName' ]
}
```

and the json data that I'm passing for this schema is 

`var data = { 'firstName': 1, 'bar': 'false', 'dateofBirth': '2014-01-22 14:56:59.301Z'}`

The schema is not getting validated, Can you please advise where I'm going wrong ?