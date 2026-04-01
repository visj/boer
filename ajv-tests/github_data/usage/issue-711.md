# [711] allOf does not break

Schema:
```json
  "$async": true,
  "properties": {
    "companyId": {
      "type": "string",
      "allOf": [
        { "objectid": true },
        { "exists": { "collection": "companies", "attribute": "_id" } }
      ]
    }
```

objectid
```javascript
{
  errors: false,
  modifying: true,
  schema: false,
  validate: (value, dataPath, object, key) => {
    if (!ObjectId.isValid(value)) {
      return false;
    }

    object[key] = new ObjectId(value);

    return true;
  }
}
```

```javascript
{
  async: true,
  errors: false,
  schema: true,
  validate: (schema, data) => {
    const Model = modules[schema.collection].model;
    return Model.exists({ [schema.attribute]: data });
  }
}
```

Why is the validate function of my custom keyword `exists` called even when my custom keyword `objectid` fails?
I thought `allOf` stops at the first fail. Is it a bug with the async set to true?
Should async be true in `objectid`?