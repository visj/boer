# [815] `$id` doesn't alter resolution scope for `{ "$ref": "#" }`

While helping someone write a JSON Schema that involves recursion, I noticed that ajv doesn't correctly resolve `{ "$ref": "#" }` when an `$id` is altering the resolution scope.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

I was using http://jsonschemalint.com which uses ajv, but I don't know exactly what version is used. I observed the same problems with draft-04 and draft-06.

**JSON Schema**

Here's an example I put together to illustrate the issue.

```json
{
  "allOf": [
    {
      "$id": "http://example.com/schema/person",
      "title": "Person",
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "spouse": { "$ref": "#" },
        "children": {
          "type": "array",
          "items": { "$ref": "#" }
        }
      },
      "required": ["name"]
    }
  ],
  "properties": {
    "root": { "const": true }
  },
  "required": ["root"]
}
```


**Sample data**

```json
{
  "root": true,
  "name": "John",
  "spouse": { "name": "Jane" },
  "children": [
    { "name": "James" },
    { "name": "Jessica" }
  ]
}
```

**Validation result, data AFTER validation, error messages**

It says that the `/spouse` schema and the `/children` schemas require a "root" property.

**What results did you expect?**

I expect the "root" property to only be required at the top level. The `$id` keyword should change the resolution scope of `{ "$ref": "#" }` so it refers to `/allOf/0` rather than the top level of the document. Using `{ "$ref": "" }` instead does work as expected.

**Are you going to resolve the issue?**

It's not likely that I will get to this any time soon. I just wanted to bring this to your attention.