# [721] Validation Schema not working in runtime, although that output passed with JSON Schema Lint

Dear all,
Im working on [https://github.com/alexa/alexa-smarthome/wiki/Validation-Schemas](https://github.com/alexa/alexa-smarthome/wiki/Validation-Schemas) with [Ajv](https://github.com/epoberezkin/ajv) validator,
Here is my code:
```javascript
'use strict'

const Ajv = require('ajv')
const draft04 = require('ajv/lib/refs/json-schema-draft-04.json')
const ajv = new Ajv()
ajv.addMetaSchema(draft04)

let schema = require('./alexa_smart_home_message_schema.json')
const ajvValidate = ajv.compile(schema)

module.exports = function (data) {
  const ok = ajvValidate(data)
  if (!ok) { console.log(ajvValidate.errors) }
  return ok
}
```
Then in runtime, value of data is : 
```json
{
  "event": {
    "header": {
      "namespace": "Alexa",
      "name": "Response",
      "payloadVersion": "3",
      "messageId": "c7d01e45-394b-4f7f-9ea6-cb527f3d390d",
      "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg=="
    },
    "endpoint": {
      "scope": {
        "type": "BearerToken",
        "token": "access-token-from-skill"
      },
      "endpointId": "58b8d2e3bfa8891000fe7ab8",
      "cookie": {}
    },
    "payload": {}
  },
  "context": {
    "properties": [
      {
        "namespace": "Alexa.ThermostatController",
        "name": "thermostatMode",
        "value": "COOL",
        "timeOfSample": "2018-02-27T03:19:52.031Z",
        "uncertaintyInMilliseconds": 500
      }
    ]
  }
}
```
I checked on [JSON SChema Lint](https://jsonschemalint.com/#/version/draft-04/markup/json) with alexa_smart_home_message_schema.json and this passed.
But in runtime, i got an error : 
```json
[
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.EndpointHealth"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.PowerController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.PowerLevelController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.PercentageController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.BrightnessController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.ColorController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.ColorTemperatureController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.LockController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].name",
    "schemaPath": "#/properties/name/enum",
    "params": {
      "allowedValues": [
        "targetSetpoint",
        "lowerSetpoint",
        "upperSetpoint"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "type",
    "dataPath": ".context.properties[0].timeOfSample",
    "schemaPath": "#/definitions/common.properties/timestamp/type",
    "params": {
      "type": "string"
    },
    "message": "should be string"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.TemperatureSensor"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.ChannelController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.InputController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.Speaker"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.Speaker"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "anyOf",
    "dataPath": ".context.properties[0]",
    "schemaPath": "#/items/anyOf",
    "params": {},
    "message": "should match some schema in anyOf"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.EndpointHealth"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.PowerController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.PowerLevelController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.PercentageController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.BrightnessController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.ColorController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.ColorTemperatureController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.LockController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].name",
    "schemaPath": "#/properties/name/enum",
    "params": {
      "allowedValues": [
        "targetSetpoint",
        "lowerSetpoint",
        "upperSetpoint"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "type",
    "dataPath": ".context.properties[0].timeOfSample",
    "schemaPath": "#/definitions/common.properties/timestamp/type",
    "params": {
      "type": "string"
    },
    "message": "should be string"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.TemperatureSensor"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.ChannelController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.InputController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.Speaker"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.Speaker"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "anyOf",
    "dataPath": ".context.properties[0]",
    "schemaPath": "#/items/anyOf",
    "params": {},
    "message": "should match some schema in anyOf"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.EndpointHealth"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.PowerController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.PowerLevelController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.PercentageController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.BrightnessController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.ColorController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.ColorTemperatureController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.LockController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].name",
    "schemaPath": "#/properties/name/enum",
    "params": {
      "allowedValues": [
        "targetSetpoint",
        "lowerSetpoint",
        "upperSetpoint"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "type",
    "dataPath": ".context.properties[0].timeOfSample",
    "schemaPath": "#/definitions/common.properties/timestamp/type",
    "params": {
      "type": "string"
    },
    "message": "should be string"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.TemperatureSensor"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.ChannelController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.InputController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.Speaker"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.Speaker"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "anyOf",
    "dataPath": ".context.properties[0]",
    "schemaPath": "#/items/anyOf",
    "params": {},
    "message": "should match some schema in anyOf"
  },
  {
    "keyword": "oneOf",
    "dataPath": "",
    "schemaPath": "#/oneOf/1/oneOf",
    "params": {},
    "message": "should match exactly one schema in oneOf"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.EndpointHealth"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.PowerController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.PowerLevelController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.PercentageController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.BrightnessController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.ColorController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.ColorTemperatureController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.LockController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].name",
    "schemaPath": "#/properties/name/enum",
    "params": {
      "allowedValues": [
        "targetSetpoint",
        "lowerSetpoint",
        "upperSetpoint"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "type",
    "dataPath": ".context.properties[0].timeOfSample",
    "schemaPath": "#/definitions/common.properties/timestamp/type",
    "params": {
      "type": "string"
    },
    "message": "should be string"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.TemperatureSensor"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.ChannelController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.InputController"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.Speaker"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".context.properties[0].namespace",
    "schemaPath": "#/properties/namespace/enum",
    "params": {
      "allowedValues": [
        "Alexa.Speaker"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "anyOf",
    "dataPath": ".context.properties[0]",
    "schemaPath": "#/items/anyOf",
    "params": {},
    "message": "should match some schema in anyOf"
  },
  {
    "keyword": "additionalProperties",
    "dataPath": "",
    "schemaPath": "#/oneOf/3/additionalProperties",
    "params": {
      "additionalProperty": "context"
    },
    "message": "should NOT have additional properties"
  },
  {
    "keyword": "additionalProperties",
    "dataPath": "",
    "schemaPath": "#/oneOf/4/additionalProperties",
    "params": {
      "additionalProperty": "context"
    },
    "message": "should NOT have additional properties"
  },
  {
    "keyword": "oneOf",
    "dataPath": "",
    "schemaPath": "#/oneOf",
    "params": {},
    "message": "should match exactly one schema in oneOf"
  }
]
```
somebody Help me ? , thanks a lot.