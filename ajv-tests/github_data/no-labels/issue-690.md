# [690] AJV always throws error "should be an object"

Hi There,

Bit of a noob in the realm of JSON schemas, NodeJS and ajv so please excuse me if there is something glaringly obvious I have overlooked here.

I have posted the different aspects of what I am trying to achieve below.

I have tested the same JSON schema and data sample using this online tool:
https://jsonschema.net/#/
and it passes validation fine using that tool.

However whenever I try to pass it using ajv running from within node I always get the following validation error raised:
 [{
    "keyword": "type",
    "dataPath": "",
    "schemaPath": "#/type",
    "params": {
        "type": "object"
    },
    "message": "should be object"
}]

I am assuming ajv thinks that the root object of the data passed in is not a valid json object ... ?

The only thing I am doing that is not really covered in the docs is requiring my JSON schema file from a relative path like so:
const assessChangesDtoSchema = require('./schemas/changeEventDto'); 

any help would be greatly appreciated.

Thanks greatly :)

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
v 6.1.0


**Ajv options object**
No ajv initializing options are used

<!-- See https://github.com/epoberezkin/ajv#options -->




**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

{
    "type": "object",
    "definitions": {},
    "$schema": "http://json-schema.org/draft-04/schema#",
    "properties": {
      "dateStamp": {
        "$id": "/properties/dateStamp",
        "type": "string",
        "title": "The Datestamp Schema",
        "description": "Date object in UTC string format.",
        "default": "",
        "examples": [
          "2018-01-29T08:26:12.911Z"
        ]
      },
      "isReversal": {
        "$id": "/properties/isReversal",
        "type": "boolean",
        "title": "The Isreversal Schema",
        "description": "A boolean value indicating whether this change event is a reversal. Reversals are only possible if the change being reversed was the last change saved",
        "default": false,
        "examples": [
          false
        ]
      },
      "editingSessionId": {
        "$id": "/properties/editingSessionId",
        "type": "string",
        "title": "The Editingsessionid Schema",
        "description": "The assessment editing session id.",
        "default": "",
        "examples": [
          "a3c65ff7-ee67-44be-846a-7dc4441d96ca"
        ]
      },
      "changeItems": {
        "$id": "/properties/changeItems",
        "type": "array",
        "items": {
          "$id": "/properties/changeItems/items",
          "type": "object",
          "properties": {
            "changeType": {
              "$id": "/properties/changeItems/items/properties/changeType",
              "type": "integer",
              "enum": [0, 1, 2, 3, 4],
              "title": "The Changetype Schema",
              "description": "ChangeType enum { ClassFrequency = 0,  ClassNessecity = 1,  Recatorisation = 2,  NAFlag = 3,  Note = 4 }.",
              "default": 0,
              "examples": [
                1
              ]
            },
            "txnId": {
              "$id": "/properties/changeItems/items/properties/txnId",
              "type": "integer",
              "title": "The Txnid Schema",
              "description": "The insights core API transaction id reference.",
              "default": 0,
              "examples": [
                402128
              ]
            },
            "changedFrom": {
              "$id": "/properties/changeItems/items/properties/changedFrom",
              "type": ["integer", "boolean"],
              "title": "The Changedfrom Schema",
              "description": "In case of a ClassNess change its the ClassNess enum value { Mandatory = 1, Discretionary = 2 }. In case of a ClassFreq change its the ClassFreq enum value { Recurring = 1, OnceOff = 2 }. In case of a Category change its the Sub Category ID. In case of a NAFlag change its a boolean value.",
              "default": 0,
              "examples": [
                2
              ]
            },
            "changedTo": {
              "$id": "/properties/changeItems/items/properties/changedTo",
              "type": ["integer", "boolean"],
              "title": "The Changedto Schema",
              "description": "In case of a ClassNess change its the ClassNess enum value { Mandatory = 1, Discretionary = 2 }. In case of a ClassFreq change its the ClassFreq enum value { Recurring = 1, OnceOff = 2 }. In case of a Category change its the Sub Category ID. In case of a NAFlag change its a boolean value.",
              "default": 0,
              "examples": [
                1
              ]
            },
            "text": {
              "$id": "/properties/changeItems/items/properties/changedTo",
              "type": "string",
              "title": "The Changedto Schema",
              "description": "Only applicable to change of type 'Note'.",
              "default": 0,
              "examples": [
                1
              ]
            }
          }
        }
      }
    }
  }


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

{
  "dateStamp": "2018-01-30T06:07:32.912Z",
  "isReversal": false,
  "editingSessionId": "32ca71b3-f110-4586-9fd8-f875d7f367b3",
  "changeItems": [
    {
      "changeType": 1,
      "txnId": 402128,
      "changedFrom": 2,
      "changedTo": 1
    },
    {
      "changeType": 0,
      "txnId": 402128,
      "changedFrom": 2,
      "changedTo": 1
    }
}
    


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

const Ajv = require('ajv');
const ajv = new Ajv({schemaId: 'id'});
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
const assessChangesDtoSchema = require('./schemas/changeEventDto');
var validate = ajv.compile(assessChangesDtoSchema);
var valid = validate(assessmentChangesDto);


**Validation result, data AFTER validation, error messages**
[{
    "keyword": "type",
    "dataPath": "",
    "schemaPath": "#/type",
    "params": {
        "type": "object"
    },
    "message": "should be object"
}]

**What results did you expect?**
I expected it to pass validation successfully.
I have tested the same schema and data within this online tool, and it passes successfully.
https://jsonschema.net/#/ 

**Are you going to resolve the issue?**
