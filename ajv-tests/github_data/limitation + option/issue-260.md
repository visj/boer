# [260] Extending properties with $ref

Considering the following schema

```
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Schema",
  "type": "object",
  "definitions": {
    "ref": {
      "type": "integer"
    }
  },
  "properties": {
      "prop": {
          "$ref": "#/definitions/ref",
          "minimum": 10
      },
      "propWithAllOf": {
          "allOf": [{
            "$ref": "#/definitions/ref",
          }, {
            "minimum": 10
          }]
      }
  }
}
```

I currently get the following results when validating against a range of input objects

| Input Object | Valid |
| --- | --- |
| `{ "prop": 10 }` | `true` |
| `{ "prop": 1 }` | `false` |
| `{ "propWithAllOf": 10 }` | `true` |
| `{ "propWithAllOf": 1 }` | `false` |

According to the [JSON spec](https://tools.ietf.org/html/draft-pbryan-zyp-json-ref-03#section-3)

> Any members other than "$ref" in a JSON Reference object SHALL be ignored.

Does that mean the second result should be `true`? Thanks!
