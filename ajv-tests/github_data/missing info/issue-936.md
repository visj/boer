# [936] custom error message for format keyword

AJV : 2.1

**JSON Schema**

```javascript
 var schema = {
         "required": ["OrderType","dateNeeded"],
            "type": "object",
            "properties": {
                "Order": {"type":"boolean"},
                "Mydate": {"type": "string","format": "date-time", errorMessage:{type:'Date must be a 
                  "mm-dd-yy" format........'}}
},
  errorMessage: { 
              format: {"Mydate":"date should be in correct format"},
              required: {
                "Mydate": 'Date is missing'},
            }} 
```

**Sample data**

```javascript
var data = {
      "expediteOrder": false,
      "dateNeeded": "",
    }
```

ERROR:
keyword schema is invalid: data/format should be string
    at Object.useCustomRule (C:\workspace\POTS-API\node_modules\ajv\lib\compile\index.js:264:20)
    at Object.generate_custom [as code] (C:\workspace\POTS-API\node_modules\ajv\lib\dotjs\custom.js:32:24)
    at generate_validate (C:\workspace\POTS-API\node_modules\ajv\lib\dotjs\validate.js:353:35)
    at localCompile (C:\workspace\POTS-API\node_modules\ajv\lib\compile\index.js:88:22)
    at Ajv.compile (C:\workspace\POTS-API\node_modules\ajv\lib\compile\index.js:55:13)
    at Ajv._compile (C:\workspace\POTS-API\node_modules\ajv\lib\ajv.js:346:27)
    at Ajv.compile (C:\workspace\POTS-API\node_modules\ajv\lib\ajv.js:112:37)
    at Object.<anonymous> (C:\workspace\POTS-API\test\unit\data-validation\tp.ts:64:20)
    at Module._compile (internal/modules/cjs/loader.js:689:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:700:10)


Expect:
It should show my custom error message.


Please help!