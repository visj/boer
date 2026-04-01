# [284] Additional Properties and defaults with schemas references

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

`4.5.0`

**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

``` javascript
{
  v5: true,
  allErrors: true,
  removeAdditional: true,
  useDefaults: true,
  schemas: schemas
}

// schemas being an array of schemas with the id property defined
```

**JSON Schema (please make it as small as possible to reproduce the issue):**

The following schemas are stripped for clarity:

**Document**

``` json
{
  "id": "document",
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "constant": "document"
    },
    "layers": {
      "type": "array",
      "items": {
        "anyOf": [
          { "$ref": "layer" },
          { "$ref": "shape" }
        ]
      },
      "default": []
    }
  },
  "required": [ "type" ],
  "additionalProperties": false
}
```

**Layer**

``` json
{
  "id": "layer",
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "constant": "layer"
    },
    "layers": {
      "type": "array",
      "items": {
        "anyOf": [
          { "$ref": "layer" },
          { "$ref": "shape" }
        ]
      },
      "default": []
    }
  },
  "required": [ "type" ],
  "additionalProperties": false
}
```

**Shape**

``` json
{
  "id": "shape",
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "constant": "shape"
    },
    "shapeType": {
      "type": "string",
      "enum": [ "rect", "oval" ]
    }
  },
  "required": [ "type", "shapeType" ],
  "additionalProperties": false
}
```

**Data (please make it as small as posssible to reproduce the issue):**

``` json
{
  "type": "document",
  "layers": [
    {
      "type": "shape",
      "shapeType": "rect"
    }
  ]
}
```

**Your code (please use `options`, `schema` and `data` as variables):**

``` javascript


```

**Validation result, data AFTER validation, error messages:**

```
data.layers[0].type should be equal to constant, data.layers[0] should have required property 'shapeType', data.layers[0] should match some schema in anyOf
```

**What results did you expect?**

A successful validation.

**Are you going to resolve the issue?**

This is issue is related to #42. If I swap `layer` and `shape` in `anyOf`, it works fine as the additional property `shapeType` comes first. But it's not a sustainable solution as I plan adding more types of layers with conflicting properties.

If I remove `removeAdditional: true` and all `additionalProperties: false`, the validation works properly but I get an unexpected `layers` property appended to my `shape` object which is not intended. It's because the `default` kicks in.

I know you probably have similar reports, but I still do not understand how a failing schema (here `layer`) in `anyOf`, can still apply `additionalProperties` or `default`. My expectations would be that those should be ignored as the schema has not been validated. When using `anyOf`, we actually expect schemas to fail.

I would really like to keep all those schema apart. Do you think there is a way to make this work properly?

Thanks alot!
