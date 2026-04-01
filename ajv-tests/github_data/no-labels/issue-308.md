# [308] Date validation fails

The validation for dates fails using "string" type and "date-time" format. From some experimentation, it seems that the failure is because the date is treated as an object and not a string. But since ajv is a JSON validator, shouldn't it validate dates as if they were strings instead of objects since that's their JSON representation?

Below is an example. By the way, I'm using version 4.3.1

Schema

```
{
  "type": "object",
  "properties": {
    "someDate": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

Object
`{ someDate: new Date() }`
