# [876] Nested $refs return wrong schemaPath

This is about ajv 6.0.0, any options.

If a `$ref` to a definition contains another, nested `$ref`, schemaPath seems to refer to the root of current schema instead of the document as a whole. There's no way to then get the full schema path to the error, which is what I need.

**JSON Schema**

```json
{
  "$schema": "http://json-schema.org/draft-06/schema#",

  "definitions": {
    "address": {
      "type": "object",
      "properties": {
        "street_number":  { "$ref": "#/definitions/number" },
        "street_address": { "type": "string" },
        "city":           { "type": "string" },
        "state":          { "type": "string" }
      },
      "required": ["street_number", "street_address", "city", "state"]
    },
    "number": {
      "type": "number"
    }
  },

  "type": "object",

  "properties": {
    "billing_address": { "$ref": "#/definitions/address" },
    "shipping_address": {
      "allOf": [
        { "$ref": "#/definitions/address" },
        { "properties":
          { "type": { "enum": [ "residential", "business" ] } },
          "required": ["type"]
        }
      ]
    }
  }
}
```


**Sample data**

```json
{
  "shipping_address": {
    "street_address": "1600 Pennsylvania Avenue NW",
    "city": "Washington",
    "state": "DC",
    "type": "business"
  }
}
```


**Your code**
(using `ajv-cli` for this test)

**Validation result, data AFTER validation, error messages**

```
simple_data.json invalid
[ { keyword: 'required',
    dataPath: '.shipping_address',
    schemaPath: '#/required',
    params: { missingProperty: 'street_number' },
    message: "should have required property 'street_number'" } ]
```

**What results did you expect?**

I expected the schemaPath to be like `#/properties/shipping_address/allOf/0/required`, instead it points erroneously to `#/required`. This problem only occurs with nested `$ref`s, which my full schema happens to have a lot of.

**Are you going to resolve the issue?**

I can have a quick look if this is an easy fix, but it would be a lot easier for someone with some understanding of the inner workings of the ajv reference and id resolver to come up with a suitable fix.