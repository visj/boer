# [13] Root ref in remote ref

Remote is added as http://localhost:1234/name.json:

```
{
  "definitions": {
    "orNull": {
      "anyOf": [
        { "type": "null" },
        { "$ref": "#" }
      ]
    }
  },
  "type": "string"
}
```

Schema:

```
{
  "id": "http://localhost:1234/object",
  "type": "object",
  "properties": {
    "name": { "$ref": "name.json#/definitions/orNull" }
  }
}
```

Data should be valid (and is invalid for ajv):

```
{  "name": "foo" }
```

Data should be invalid (and is valid for ajv):

```
{
  "name": {
    "name": null
  }
}
```

So essentially # in name.json refers to object.json instead of name.json.
