# [847] Confused about using multiple versions at the same time

This is more of a question than an issue.  If I wanted to use draft-04, 06 and 07 at the same time, would this be the correct way to do it ?

```javascript
var ajv = new Ajv({schemaId: 'auto'});
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'))
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'))
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-07.json'))
```

Also, if `id` or `$id` is not defined in the schema, which version will it validate against by default ?

Thanks !