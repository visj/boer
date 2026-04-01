# [2271] Refering to value of maximum characters allowed, throws an error in console

Hi,

In the below given example:
```
{
  "default": "adsds",
  "max": 1
}
```
I wanted to refer to the 'max' value that is provided dynamically and wanted to validate the number of characters entered in 'default' field. So per that i developed a schema as below:

```
{
  "type": "object",
  "properties": {
    "max": {
      "type": "integer"
    },
    "default": {
      "type": "string",
      "maxLength": {
        "$data": "1/max"
      }
    }
  }
}
```

But this doesnt seem to work and an error is thrown in the console as,
_ERROR Error: schema is invalid: data/properties/default/maxLength must be integer_

_Please click the below link to check the issue mentioned above._
https://codesandbox.io/s/beautiful-frog-2hrlch?file=/src/app/app.component.ts

_**Versions:**_
"ajv": "^8.12.0",
"ajv-errors": "^3.0.0",
"ajv-keywords": "^5.1.0",