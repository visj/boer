# [455] getSchema call produces undefined validate function

I am loading in two schema files and attempting to validate data against these schemas. The schemas seem to load fine and a valid ajv object is created containing these schemas, with no error. But when I attempt to getSchema, no error is produced but the validate function returned is undefined. The code I am using to do this is here:

```
var ajv = Ajv({
                  allErrors: true, 
                  verbose: true, 
                  schemas: [
                      require('../matchRule.json'), 
                      require('../matchGroup.json')
                  ]
             });

var validate;
try {
    validate = ajv.getSchema('matchRule#');
    console.log("validate: " + JSON.stringify(validate));
}
catch (e) {
    console.log("Error parsing schema: " + e);
    return;
}
```

The first few lines of the first file are:
```
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "id": "matchRule#",
    "type": "object",
```

I thought I was supposed to be able to use the id key as input to getSchema, but do I need to use something else? Any help would be appreciated.

Don