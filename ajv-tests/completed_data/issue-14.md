# [14] Remote ref in definitions in remote ref with ids

```
"schema": {
  "id": "http://localhost:1234/issue14b.json",
  "type": "array",
  "items": { "$ref": "buu.json#/definitions/buu" }
}
```

```
{
  "id": "http://localhost:1234/buu.json",
  "definitions": {
    "buu": {
      "type": "object",
      "properties": {
        "bar": { "$ref": "bar.json" }
      }
    }
  }
}
```

```
{
  "id": "http://localhost:1234/bar.json",
  "type": "string"
}
```

Data:

```
[
  {
    "bar": "any string"
  }
]
```

Loses resolution scope when it gets in definitions
