# [938] When using compileAsync, only resolve $ref when needed.

I am trying to use ajv as a validator of http request bodies.
The request body gets validated against a json-schema that has various NON-REQUIRED properties of type $ref. 
I would expect the validator to only resolve the $ref if the incoming http body has that property.
Otherwise it is making unnecessary requests to resolve the references because there is nothing to validate.

Example http body:
```javascript
{
  name: "samuel"
  email: "sam@email.com"
}
```

Example json-schema

```
{
  "id":"CreateUserRequest","
  type":"object","
  additionalProperties":false,
  "properties": {
      "name":{"type":"string"},
      "email":{"type":"string"},
      "roles":{"type":"array", "items":{"$ref":"Role"}}
      "labels":{"type":"array", "items":{"$ref":"Label"}}
      "tasks":{"type":"array", "items":{"$ref":"Taks"}}
      "teams":{"type":"array", "items":{"$ref":"Team"}}
  },
  "required":["name", "email"]
}
```
In this case I pass the loadSchema function to compileAsync.

```javascript
let ajv = new Ajv({ loadSchema: this.loadSchema });
```

and even though the input http body has none of the properties that need to be resolved, the loadSchema method gets called once for every $ref, even though its not necessary.
