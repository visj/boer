# [521] incorrect warning with option {schemaId: '$id'} and property "id"

Using the latest version (5.1.5), with the following options:
```javascript
{
    schemaId: "$id", 
    extendRefs: 'fail',
}
```
Compiling this schema:
```json
{
  "$id": "http://mydomain/schemas/node.json",
  "type": "object",
  "properties": {
    "id": {
      "description": "The unique identifier for a node",
      "type": "string"
    },
  },
  "required": [ "id"]
}
```

produces the following message: `schema id ignored { type: 'string' }`
I was expecting the object to just be able to have a string property called `id`. I've seen quite a few examples online (e.g. [here](http://json-schema.org/example1.html)) for this, so I'm not sure what's wrong here. I suspect it's the `schemaId` flag, but I don't understand why it applies to the `id` in the property map . I also have no idea how to make the `$id` coexist with the property named `id`.