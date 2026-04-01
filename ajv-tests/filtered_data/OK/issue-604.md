# [604] Required and Default object's fields  in array of objects

**Versions**
Ajv 5.2.4, Nodejs 8.1.4
yes, versions are the latest 

**Ajv options object**
{allErrors: true, removeAdditional: true, useDefaults: true}

**JSON Schema**
```json
{
    "type"      : "object",
    "required"  : ["orderUid", "itemIndex", "personUid", "rolls", "staff"],
    "properties": {
        "orderUid"   : {"type": "string"},
        "itemIndex"  : {"type": "number"},
        "personUid"  : {"type": "string"},
        "rolls" : {
            "type"      : "array",
            "minItems"  : 1,
            "items"     : [
                {
                    "type"          : "object",
                    "required"      : ["uid", "length"],
                    "additionalProperties": false,
                    "properties"    : {
                        "uid"   : { "type": "string"},
                        "length": { "type": "number", "minimum": 1},
                        "waste" : { "type": "number", "default": 0}
                    }
                }                
            ]
        },
        "staff" : {
            "type"      : "array",
            "minItems"  : 1,
            "items"     : [
                {
                    "type"          : "object",
                    "required"      : ["uid", "length", "quantity", "waste"],
                    "additionalProperties": false,
                    "properties"    : {
                        "uid"     : { "type": "string"},
                        "length"  : { "type": "number", "minimum": 1},
                        "quantity": { "type": "number"},
                        "waste"   : { "type": "number"}
                    }
                }                
            ]
        },         
    }    
}
```

**Sample data**
```json
{
  "orderUid": "12e6f577-86ee-11e6-bff0-e894f603126e",
  "itemIndex": 0,
  "personUid": "cdecd99c-6b40-11e5-934e-e894f603126e",
  "rolls": [
    {
      "uid": "8f352826-3a7d-11e5-858b-e894f6031266",
      "length": 10,
      "waste": 1
    },
    {
      "uid": "8f352826-3a7d-11e5-858b-e894f6031266",
      "length": 140,
      "waste": 1
    }
  ],
  "staff": [
    {
      "uid": "cdecd99c-6b40-11e5-934e-e894f603126e",
      "length": 10,
      "quantity": 14,
      "waste": 2
    },
    {
      "uid": "cdecd99c-6b40-11e5-934e-e894f6031264",
      "length": 10,
      "quantity": 1,
      "waste": 3
    }
  ]
}
```

**Expected**
1. verify presence and data type of the required fields in all objects included in array as elements
2. add default values for object fields in all objects included in array as elements 

**Result**
1. "required" condition is verified only for the first element (fields of the first object) of the array
2. "default" values are inserted only in first element (fields of the first object) of the array 
