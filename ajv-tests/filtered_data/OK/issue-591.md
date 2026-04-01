# [591] Type string property being required to be array?

Hi, i'm having an error when trying to validate a schema and i don't understand the problem.

The schema is as follows:

```javascript
var _schema = {
    "$schema"               : "http://json-schema.org/schema#",
    "type"                  : "object",
    "title"                 : "Modificar Grupo",
    "properties"            : {
        "name"              : { "max_Length": 255, "title": "Nombre", "type": "string" },
        "description"       : { "max_Length": 255, "title": "Descripción", "type": "string" },
        "enabled"           : { "title": "Habilitado", "type": "boolean" }
    },
    "required"              : [ "name", "description", "enabled" ],
    "additionalProperties"  : false
}
```

The input data is:
```javascript
var _data = {
    "name": "Default",
    "description": "Grupo default de terminales",
    "enabled": true
}
```

If i try to validate the schema with this code:

```javascript
var ajv = new Ajv( { allErrors : true, unknownFormats : 'ignore', removeAdditional : true } );
ajv.validateSchema(_schema);
console.log('ERRORS ' + JSON.stringify(ajv.errors, null, 4));
```

What i get is the following:

```javascript
[
    {
        "keyword": "type",
        "dataPath": ".properties['name'].required",
        "schemaPath": "#/definitions/stringArray/type",
        "params": {
            "type": "array"
        },
        "message": "should be array"
    },
    {
        "keyword": "type",
        "dataPath": ".properties['description'].required",
        "schemaPath": "#/definitions/stringArray/type",
        "params": {
            "type": "array"
        },
        "message": "should be array"
    },
    {
        "keyword": "type",
        "dataPath": ".properties['enabled'].required",
        "schemaPath": "#/definitions/stringArray/type",
        "params": {
            "type": "array"
        },
        "message": "should be array"
    }
]
```

It seems to me that the presence of the maxLength property is inconsistent with the type string?
What am i doing wrong? 

Thanks for any feedback!