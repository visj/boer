# [971] Validation error with allOf and additionalProperties: false

Use : AJV 6.10.0
With options : 
```javascript
        ajv = require('ajv')({
            allErrors: true,
            verbose: true,
            removeAdditional: false,
        });
```
**JSON Schema**
```json
"deliveryContact": {
      "allOf": [
        {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "name": {
              "type": "string",
              "maxLength": 1024
            },
            "phone": {
              "type": "string",
              "maxLength": 24
            }
          }
        },
        {
          "$ref": "#/definitions/address"
        }
      ]
    },
    "address": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "address": {
          "type": "string",
          "maxLength": 1024
        },
        "postalCode": {
          "type": "string",
          "maxLength": 12
        },
        "city": {
          "type": "string",
          "maxLength": 512
        },
        "state": {
          "type": "string",
          "maxLength": 512
        }
      }
    },
```

**Sample data**
```json
                   delivery: {
                        address: 'my address',
                        postalCode: 'my postalCode',
                        city: 'my city',
                        state: 'my state',
                        name: 'my name',
                        phone: 'my phone'
                    },

```

**What results did you expect?**
I expect validation of the data.
Actually I have 6 errors wich warn of additional properties for each properties

**Are you going to resolve the issue?**
During validation of the first object in allOf (name and phone), validation found error on (address, postalCode, city and state)

If I remove additionalProperties of the first allOf obejct (name, phone), during validation of address schema, the validation found error on (name and phone)


Perhaps a write a wrong schema definition