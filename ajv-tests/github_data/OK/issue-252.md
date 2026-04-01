# [252] Bug: oneOf doesn't work properly when coerceTypes is true

ajv version: 4.3.0

config:

``` json
{"coerceTypes": true}
```

schema:

``` json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "username": {
      "oneOf": [
        {"type": "string"},
        {"type": "null"}
      ]
    }
  }
}
```

data:

``` json
{"username": null}
```

error:

``` json
[{"keyword":"oneOf","dataPath":".username","schemaPath":"#/properties/username/oneOf","params":{},"message":"should match exactly one schema in oneOf"}]
```

It pass when `{coerceTypes: false}`, so I guess it is a bug
