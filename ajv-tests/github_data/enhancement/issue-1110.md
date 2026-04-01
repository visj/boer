# [1110] Add JSONPointer pointing to $ref in missingRef exception

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
yes , latest 6.10

**Ajv options object**
```
ajv = new Ajv
      allErrors    : no
      verbose      : yes
      jsonPointers : yes
      format       : 'full'
      sourceCode   : yes
```



```javascript
Exception
{
  "message":"can't resolve reference #company from id https://customers-2db8.restdb.io/static/db/schema.json#",
  "missingRef":"https://customers-2db8.restdb.io/static/db/schema.json#company",
  "missingSchema":"https://customers-2db8.restdb.io/static/db/schema.json"
}
```

**What results did you expect?**
a dataPath/JSONPointer that identifies the position of the ref "#company".

**Are you going to resolve the issue?**
probably by walking the schema-ast