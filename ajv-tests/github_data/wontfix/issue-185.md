# [185] $ref with relative path does not use schema key as base for resolution (only uses schema ID)

I have some Schemas in different directories which are referring each others. 
All are fetched with XHR and put to ajv afterwards.
Below is a reduced test case:

```
<html>
<head>
<script type="text/javascript" 
  src="https://cdnjs.cloudflare.com/ajax/libs/ajv/4.0.5/ajv.bundle.js"></script>
</head>
<script>
var ajv = Ajv();
var secondschema  = {
    "$schema": "http://json-schema.org/draft-04/schema",
    "type": "object",
    "properties": {
        "objectType": {
          "type": "string"
        }
    }
};

var firstschema = {
    "$schema": "http://json-schema.org/draft-04/schema",
    "type": "object",
    "properties": {
        "angle": { "type": "number" },
        "substuff": {
            "type": "array",
            "items": { "$ref": "secondschema.Schema.json#" }
        }
    }
};

ajv.addSchema(secondschema, "/Schema/secondschema.Schema.json");
ajv.addSchema(firstschema, "/Schema/firstschema.Schema.json");
//real code has "/special/stuff/Schema/firstschema.Schema.json" and other schemas

var valid = ajv.validate("/Schema/firstschema.Schema.json", {"test": "me"});
// Uncaught Error: can't resolve reference secondschema.Schema.json# from id #

</script>
</html>
```

Is this a bug or am i doing something wrong?
