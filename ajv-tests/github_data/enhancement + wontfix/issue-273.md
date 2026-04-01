# [273] schemaPath in error in referenced schema depends on the reference

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
-->

**JSON Schema (please make it as small as possible to reproduce the issue):**

``` json
{
  "properties": {
    "a": { "$ref": "int" }
  }  
}
```

int:

``` json
{
  "id": "int",
  "type": "integer"
}
```

**Data (please make it as small as posssible to reproduce the issue):**

``` json
{ "a": "foo" }
```

**Your code (please use `options`, `schema` and `data` as variables):**

``` javascript
ajv.addSchema({
  "id": "int",
  "type": "integer"
});

var validate = ajv.compile({
  "properties": {
    "a": { "$ref": "int" }
  }  
});

validate(data);
```

<!--
It would help if you post a working code sample in Tonic notebook and include the link here. You can clone this notebook: https://tonicdev.com/esp/ajv-issue.
-->

See [code](https://tonicdev.com/esp/57af69ead7f6d81300bd72c8)

**Validation result, data AFTER validation, error messages:**

Result: false

errors:

``` json
[{
  "keyword":"type",
  "dataPath":".a",
  "schemaPath":"int/type",
  "params":{"type":"integer"},
  "message":"should be integer"}
]
```

**What results did you expect?**

schemaPath should be "int#/type" (if parent schema has {$ref:'int#'} it will be as it should).
