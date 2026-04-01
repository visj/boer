# [489] Validate JSON Schema

 I validate JSON request against the JSON Schema,
Input may be address request or Phone request
If the request is Address, then i need to validate mandatory fields in address
If the request is Phone, then i need to validate mandatory fields in phone

But my below JSON schema, Please correct me if anything wrong

```
{
  "any Of": [
    {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "definitions": {},
      "id": "http://example.com/example.json",
      "properties": {
        "addresses": {
          "id": "/properties/addresses",
          "properties": {
            "address1": {
              "id": "/properties/addresses/properties/address1",
              "type": "string"
            },
            "address2": {
              "id": "/properties/addresses/properties/address2",
              "type": "string"
            },
            "countryId": {
              "id": "/properties/addresses/properties/countryId",
              "type": "string"
            },
            "stateId": {
              "id": "/properties/addresses/properties/stateId",
              "type": "string"
            },
            "typeId": {
              "id": "/properties/addresses/properties/typeId",
              "type": "string"
            }
          },
          "required": [
            "stateId",
            "typeId",
            "countryId"
          ],
          "type": "object"
        }
      },
      "type": "object"
    },
    {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "definitions": {},
      "id": "http://example.com/example1.json",
      "properties": {
        "phones": {
          "id": "/properties/phones",
          "properties": {
            "areaCode": {
              "id": "/properties/phones/properties/areaCode",
              "type": "string"
            },
            "typeId": {
              "id": "/properties/phones/properties/typeId",
              "type": "string"
            }
          },
          "required": [
            "typeId"
          ],
          "type": "object"
        }
      },
      "type": "object"
    }
  ]
}
```

Validate against the below JSON phone request
```
{
  "phones":
    {
      "areaCode":"972",
      
    }
}
```

Even Type Id is required, it is not showing JSON 'FAILED' in the below online JSON validator
http://www.jsonschemavalidator.net/
