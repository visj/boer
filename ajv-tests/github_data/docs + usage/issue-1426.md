# [1426] Inlining schemas with json-schema-ref-parser is unnecessary, and may not work in case inlined schemas have $id

I think this might be a V7 bug as my schemas were all passing with V6.

If an external schema is referenced using `$ref` by more than one property, or within a property defined in the `definitions` section, and the `$refs` are resolved by putting the schemas inline, as with [json-schema-ref-parser](https://github.com/APIDevTools/json-schema-ref-parser), then compilation fails with the error

```
reference "https://schemas.example.com/samples/child" resolves to more than one schema
```

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
7.0.4

**Ajv options object**
{}

**JSON Schema**

### samples/parent.schema.json 
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://schemas.example.com/samples/parent",
  "title": "Schema that references another schema multiple times",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "eldestChild": {
      "$ref": "./child.schema.json"
    },
    "youngestChild": {
      "$ref": "./child.schema.json"
    }
  }
}
```

### samples/child.schema.json
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://schemas.example.com/samples/child",
  "title": "Schema referenced from a parent",
  "description": "Example description",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    }
  }
}
```

It also happens if the `$ref` only appears once in the file but it's inside an object in the definitions section:

### samples/parent2.schema.json
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://schemas.example.com/samples/parent2",
  "title": "Schema that references another schema",
  "description": "Example description",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "children": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/child"
      }
    }
  },
  "definitions": {
    "child": {
      "type": "object",
      "properties": {
        "order": {
          "type": "number"
        },
        "details": {
          "$ref": "./child.schema.json"
        }
      }
    }
  }
}
```

This seems to be because `traverse()` finds it multiple times.

**Your code**

```javascript
const Ajv    = require('ajv').default
const $RefParser = require('json-schema-ref-parser')

const ajv = new Ajv();

$RefParser.dereference("samples/parent.schema.json", function(err, schema) {
  if (err) throw err
  try {
    ajv.compile(schema);
    console.log('[ PASS ] Schema validation passed.')
  }
  catch (e) {
    console.log(`[ FAIL ] Schema validation failed: "${e.message}"]`)
    process.exit(1)
  }
})
```

**Validation result, data AFTER validation, error messages**

```
[ FAIL ] Schema validation failed: "reference "https://schemas.example.com/samples/child" resolves to more than one schema"]
```

**What results did you expect?**
Schemas pass compilation. It's perfectly valid to reference an external schema multiple times or from inside local definitions, and it used to work fine.

**Are you going to resolve the issue?**
Maybe, but I'm not quite sure where to start. It seems like it's not necessary to throw an error if a schema is referenced more than once, since it didn't used to. But I assume that code was added for a reason, and I don't know what that reason is, or if anything bad would happen if it were removed.
