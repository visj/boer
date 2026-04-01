# [202] $data json-pointer to array length

Hi, I might be reading spec wrong, but here is a use-case where I need to have identical length of the passed arrays of properties and looks like ajv compiles it wrong (or maybe I'm just reading the spec incorrectly).

Here is the case, that does what I want correctly, audience would have _at least_ the same length as passed metadata

``` json
"required": [ "username", "audience", "metadata" ],
"properties": {
  "audience": {
    "type": "array",
    "minItems": {
      "$data": "1/metadata/length"
     },
     "items": {
       "type": "string",
       "minLength": 1
     }
  },
  "metadata": {
    "type": "array",
    "minItems": 1,
    "items": {
      "$ref": "#/definitions/metadata"
          }
        }
      }
```

However, if I use `"$data": "1/metadata#"` - it doesn't resolve to array's length, but instead tries to resolve ['metadata#'] property

Can you clarify usage of `#` ?
