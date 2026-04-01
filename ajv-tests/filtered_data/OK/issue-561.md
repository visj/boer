# [561] Use JSON pointer in array across multiple schemas

Hi I'm trying to use JSON references but I don't get it to work.

Ajv: 5.2.2
NodeJs: 8.4

entry.json
```json
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "id": "http://mynet.com/schemas/entry.json#",
  "title": "Entry",
  "type": "object",
  "required": ["fields"],
  "properties": {
    "fields": {
      "type": "array",
      "items": {
        "anyOf": [
          {
            "$ref": "http://mynet.com/schemas/entryField.json#"
          }
        ]
      }
    }
  }
}
```
entryField.json
```json
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "id": "http://mynet.com/schemas/entryField.json#",
  "title": "EntryField",
  "type": "object",
  "required": ["title"],
  "properties": {
    "title": {
      "type": "string"
    }
  }
}
```

Test data:
```json
{
	"fields": [{
		"title": 22
	}]
}

// error
"message": "data should have required property 'title'",
    "errors": [
        {
            "keyword": "required",
            "dataPath": "",
            "schemaPath": "#/required",
            "params": {
                "missingProperty": "title"
            },
            "message": "should have required property 'title'"
        }
    ]
```

I expect that this is validated without errors but get the _same_ error
```json
{
	"fields": [{
		"title": "dedede"
	}]
}
```

When I add a `title` property on the root level it works why?

```json
{
	"fields": [{
		"title": "dedede"
	}],
 "title": "test"
}
```

Code:
```js
const ajv = Ajv({
  allErrors: true,
  extendRefs: 'fail'
})

ajv.addSchema(entryField, 'entryField')
ajv.addSchema(entry, 'entry')
var valid = ajv.validate('entry', req.body)
console.log(ajv.errors)
```

**What do I have to consider ?** Thanks!
