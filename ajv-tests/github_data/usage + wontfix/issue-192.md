# [192] coerceTypes: true only works with "type", can I use coerceTypes: true for "format", if not then can I define my own custom type?

My json schema is having many data types, for example date-time, mongoid etc. I liked the concept of coerceTypes: true which help to convert my input json data to corresponding type. However it only works for "type". Since "type" has limited to primitive data types therefore I can't use it for "date-time" or "mongo db id". 

I tried to use the custom "addFormat" method however it doesn't seem like working. Following is my code. Please help.

```
validateSchema: (document, callback)=> {
    //read schema as per collection name
    const collectionName = "schema";
    const schema = require("./transactions/" + collectionName + ".json");
    var ajv      = Ajv({loadSchema: module.exports.loadSchema, coerceTypes: true});
    ajv.addFormat('date-time', function(data, cb) {
      try {
        var obj = new Date(data);
      } catch (err) {
        return cb(err);
      }
      cb(null, obj);
    })
    //compile schema as per $ref
    ajv.compileAsync(schema, function(err, validate) {
      if (err) {
        console.log("validateAgainstSchema err " + err);
        callback(false);
      }
      var valid = validate(document);
      !valid && console.log("error in json schema validation " + JSON.stringify(validate.errors));
      console.log("document after validation  status " + valid + "  modified document " + JSON.stringify(document));
      callback(valid);
    });
  }
```

Following is my scema

```
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "definitions": {
    "address": {
      "type": "object",
      "properties": {
        "street_address": {
          "type": "string"
        },
        "city": {
          "type": "string"
        },
        "state": {
          "type": "string"
        },
        "zip": {
          "type": "number"
        },
        "builton": {
          "format": "date-time"
        },
        "_id": {
          "format": "mongoid"
        }
      },
      "required": [
        "street_address",
        "city",
        "state",
        "zip",
        "builton",
         "_id"
      ]
    }
  },
  "type": "object",
  "properties": {
    "billing_address": {
      "$ref": "#/definitions/address"
    },
    "shipping_address": {
      "$ref": "#/definitions/address"
    }
  }
}
```

Following is test data

```
{
  "shipping_address": {
    "_id":"573a1093d918fe4c19e054d7",
    "zip":"85027",
    "street_address": "1600 Pennsylvania Avenue NW",
    "city": "Washington",
    "state": "DC",
    "builton":"2016-03-01T15:55:00.000Z"
  },
  "billing_address": {
    "_id":"573a1093d918fe4c19e054d6",
    "zip":85027,
    "street_address": "1st Street SE",
    "city": "Washington",
    "state": "DC",
    "builton":"2015-03-01T15:55:00.000Z"
  }
}
```

On successful validation, I want this to convert as following

```
{
  "shipping_address": {
    "_id":ObjectId("573a1093d918fe4c19e054d7"),
    "zip":"85027",
    "street_address": "1600 Pennsylvania Avenue NW",
    "city": "Washington",
    "state": "DC",
    "builton": new Date("2016-03-01T15:55:00.000Z")
  },
  "billing_address": {
    "_id":ObjectId("573a1093d918fe4c19e054d6"),
    "zip":85027,
    "street_address": "1st Street SE",
    "city": "Washington",
    "state": "DC",
    "builton": new Date("2015-03-01T15:55:00.000Z")
  }
}

```
