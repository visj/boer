# [160] How to validate objects against Nested Schema?

My Schema is as below. Zone schema inherits Coordinate schema.

``` json
 "Coordinate": {
    "id": "Coordinate",
    "required":["x","y","z"],
    "properties": {
      "x": {        "type": "number"      },
      "y": {        "type": "number"      },
      "z": {        "type": "number"      }
    }
  },
  "Zone": {
    "id": "Coordinate",
    "required":["name","coordinate"],
    "properties": {
      "name": {        "type": "string"      },
      "coordinates": {        "type": "Coordinate"      }
    }
  }
```

Im trying to validate a object (http request) againt the "Zone" schema using ajv as below: 
`var valid = ajv.validate(schemas.Zone, request);`

Ajv throws the following error:
_Error: schema is invalid:data.properties['coordinates'].type should be equal to one of the allowed values, data.properties['coordinates'].type should be array, data.properties['coordinates'].type should match some schema in anyOf_

How can i get ajv to validate my nested Schema?
