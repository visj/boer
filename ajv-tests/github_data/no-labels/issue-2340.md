# [2340] Usage: Conditionally reference subschemas

Hi, I am trying to conditionally reference a subschema and this is my json schema
```
{
  "$id": "https://dpp.delori.io/api/v1/schemas/product.json",
  "title": "Product",
  "description": "This is a base schema of a DPP product.",
  "type": "object",
  "required": [
    "_typeName",
  ],
  "additionalProperties": false,
  "properties": {
    "_typeName": {
      "type": "string"
    },
    "categorySpecific": {
      "type": "object",
      "oneOf": [
        {
          "if": {
            "properties": {
              "_typeName": {
                "const": "Wine"
              }
            }
          },
          "then": {
            "$ref": "sub/wine.json"
          }
        },
        {
          "if": {
            "properties": {
              "_typeName": {
                "const": "Furniture"
              }
            }
          },
          "then": {
            "$ref": "sub/furniture.json"
          }
        }
      ]
    }
  }
}
```
Unfortunately, it's always validating against `wine.json` subschema even when `_typeName` is `Furniture`. I've tried changing places and moved `Furniture` subschema as a first item in the array and now it always validates against `furniture.json`.

What am I doing wrong here? Is it even possible to reference subschemas the way I'm trying to do here?

`ajv: 8.12.0`
`ajv-formats: 2.1.1`
