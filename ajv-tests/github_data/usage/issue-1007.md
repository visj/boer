# [1007] Validation fails for number field if no value

Hi,
 I'm using JSON schema draft version 4 using following codes - 
```
            let ajv = new Ajv({schemaId: 'id'});
            ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
              let valid = ajv.validate(schema, data); 
              if (!valid) throw ajv.errors;
```

Few of the fields are defined as number and not required. Thus if I pass "" of those fields have no value, validation fails and it says - 
"should be a number"

How can I pass empty value then so validator wont through error for that?

Thanks
Musa