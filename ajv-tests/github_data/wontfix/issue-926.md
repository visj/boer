# [926] ajv Override Validation Functions

I have a requirement where I need to Override the String Validation Functions. I can't modify anything in the JSON Schema, as my product is dependant on it. 

Example, String can be null, but I can't add isNullable as a key in the JSONSchema as my product is dynamically generating it and using it. Is there a way where we can override the existing String Validation Function to accept String as Null also?? I'm sharing my current implementation.

Kindly help me on this. Excuse for my immaturity in raising this issue as I have some strict deadline to meet.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Latest version

**JSON Schema**

```json
"OriginalOrderId": {
      "title": "Order ID",
      "description": "Order ID",
      "display": {
        "name": "Original Order ID",
        "description": "Original Order ID",
        "required": false,
        "visible": true,
        "order": 6,
        "tags": [
          "OriginalOrderID",
          "originalorderid"
        ]
      },
      "type": "string"
    }
```


**Sample data**

```json

{ "OriginalOrderId": null }

```


**Your code**


```javascript
function validateString(str) {
  return _.isString(str) || str === null
}
ajv.addFormat('int32', validateString, ['string']);

var valid = ajv.validate(newSchema, value);
```


