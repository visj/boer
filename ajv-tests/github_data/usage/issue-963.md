# [963] Validate a part of the target document using a schema embedded in the target document

Hello. I was trying to figure out whether I can model the following (simplification of my actual) use case with JSON schema:

schema.json

```
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "type": "object",
  "properties": {
    "input": { "$ref": "http://json-schema.org/draft-07/schema" },
    "defaults": { "$ref": { "$data": "1/input" } }
  }
}
```

In other words, I would like to validate a particular part of the target document against a schema that is defined in the target document. Is something like this possible in JSON schema or in the AJV extension of it?