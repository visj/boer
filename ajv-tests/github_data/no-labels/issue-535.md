# [535] "required" question

```
var schema = {
  "id": "test.json#",
  "definitions": {
    "body": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "age": {"type": "integer"},
      }
    },
    "request": {
      "properties": {
        "user": {
          "$ref": "#/definitions/body"
        }
      }
    }
  },
  "typeA": {
    "$ref": "#/definitions/request"
  },
  "typeB": {
    "allOf": [
      {"$ref": "#/definitions/request"},
      {"required": ["name"]} // Should require the name field in the user object.
    ]
  }
}

var Ajv = require('ajv')
var ajv = Ajv({
  schemas: [schema]
})

var data = {
  user: {
    "name": "tom",
    "age": 1
  }
}

var valid = ajv.validate({$ref: "test.json#/typeA"}, data)
console.log('VALID', valid) // Returns true.
var valid = ajv.validate({$ref: "test.json#/typeB"}, data)
console.log('VALID', valid) // Returns false.
```

I'm new to ajv and json schemas. I'd like to reuse the request-schema in typeA and typeB. typeB should require the name field in the user-object. How do I achieve this? I know why my solution above is not working. Required should be something like "user.name".

Thanks you for your help.