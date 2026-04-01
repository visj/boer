# [1450] https $schema not supported

Using ajv 6.7.0, with the schema

```json
{
        "$id": "https://json-schema.org/draft-07/schema",
        "$schema": "https://json-schema.org/draft-07/schema",
        "additionalProperties": false,
        "properties": {},
        "title": "SomeTitle",
        "type": "object"
      }
```

ajv complains with the error `no schema with key or ref "https://json-schema.org/draft-07/schema"`.
The error does not occur replacing `https` with `http` in the uri.
Is `https` not supported?