# [706] Dynamic schema

Is it possible to have a dynamic schema depending on a value given during the validation (so after the compilation)?

A sample schema:
```javascript
{
  "title": "Product",
  "type": "object",
  "additionalProperties": false,
  "required": ["name"],
  "properties": {
    "name": { "type": "string" },
    "companyId": { "type": "string" }
  }
}
```

I would like to require `companyId` depending on my logged user's role (admin or simple user).

I was thinking to a third parameter `extra` to method validate: `ajv.validate(schemaName, data, extra)`. I would have given `{ role: 'admininistrator' }` or `{ role: 'user' }` to this parameter.

I guess there is a way to achieve this without having to load multiple static schemas?