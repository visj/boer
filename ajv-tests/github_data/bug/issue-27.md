# [27] RangeError: Maximum call stack size exceeded when using recursive reference

Correct me if I'm doing something wrong. Wrote this based on: http://spacetelescope.github.io/understanding-json-schema/index.html

``` JSON
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "id": "testrec",
  "type": "object",
  "properties": {
    "layout": {
      "id": "layout",
      "type": "object",
      "properties": {
        "layout": { "type": "string" },
        "panels": {
          "type": "array",
          "items": {
            "oneOf": [
              { "type": "string" },
              { "$ref": "layout" }
            ]
          }
        }
      },
      "required": [
        "layout",
        "panels"
      ]
    }
  }
}
```
