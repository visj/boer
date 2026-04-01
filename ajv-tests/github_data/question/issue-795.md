# [795] Duplicate required properties returns missing property error

Using AJV 6.1.1

If I have the following schema:

```javascript
var loginSchema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "id": "AuthenticationRequest",
  "title": "Authentication Request",
  "description": "Request body for an authentication request",
  "type": "object",
  "properties": {
    "provider": { "type": "string", "minLength": 2, "maxLength": 50 },
    "username": { "type": "string", "minLength": 2, "maxLength": 50 },
    "password": { "type": "string", "minLength": 7, "maxLength": 100 }
  },
  "required": ["provider", "username", "password"],
  "additionalProperties": false
};
var validateLoginSchema = ajv.compile(loginSchema);
```

if I send a body of the request with duplicate required properties:
```json
{
    "provider": "local",
    "username": "User A",
    "username": "User B",
    "username": "User C",
    "username": "User D",
    "username": "User E",
    "username": "User 1",
    "username": "User F",
    "username": "User G",
    "password": "password1"
}
```

The errors ajv gives back is:
```json
{
    "errors": [
        {
            "keyword": "required",
            "dataPath": "",
            "schemaPath": "#/required",
            "params": {
                "missingProperty": "provider"
            },
            "message": "should have required property 'provider'"
        },
        {
            "keyword": "required",
            "dataPath": "",
            "schemaPath": "#/required",
            "params": {
                "missingProperty": "username"
            },
            "message": "should have required property 'username'"
        },
        {
            "keyword": "required",
            "dataPath": "",
            "schemaPath": "#/required",
            "params": {
                "missingProperty": "password"
            },
            "message": "should have required property 'password'"
        }
    ]
}
```

I would expect an error stating something like duplicate required properties rather than missing properties as all the required properties actually are specified.


