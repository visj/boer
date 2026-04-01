# [170] Resolution of local id is made relative to id of a sibling not parent

When using schema provided below the validation fails with error although IMHO it is correct ("file" property is a sibling to "title" so "title"'s id should not affect its scope):

> ajv compile -s schema.json
> schema schema.json is invalid
> error: can't resolve reference #/definitions/file-entry from id http://example.com/title

Schema:

``` json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "id": "http://example.com/base",
  "type": "object",
  "properties": {
    "title": {
      "id": "http://example.com/title",
      "type": "string"
    },
    "file": {
      "$ref": "#/definitions/file-entry"
    }
  },
  "definitions": {
    "file-entry": {
      "type": "string"
    }
  }
}
```
