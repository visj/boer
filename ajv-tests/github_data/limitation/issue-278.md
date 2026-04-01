# [278] Support relative $ref's in $merge and $patch keywords

I am trying to test v5 feature and $merge keyword but I get this error. I am using this online validator 

https://tonicdev.com/npm/ajv

I've read this article and based on that all these references in my schema I believe is correct
http://code.tutsplus.com/tutorials/validating-data-with-json-schema-part-2--cms-25640

```
var Ajv = require('ajv');
var ajv = Ajv({allErrors: true, v5: true});
require('ajv-merge-patch')(ajv);

var schema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
"id": "test-address-prefix-types.json#",

    "base-create-test-address-prefix-types": {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "id": "#base-create",
        "definitions": {
            "bar": { "id": "#bar", "type": "integer" }
        },
        "type": "object",
        "properties": {
            "id": {
                "type": "null"
            },
            "type": {
                "type": "string",
            "enum": [
                "test-address-prefix-types", "test-address-prefix-types-extended"
            ]
            },
            "attributes": {
                "type": "object",
                "properties": {
                    "prefixType": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 8
                    },
                    "notation": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "maxLength": 255
                    }
                },
                "required": [
                    "prefixType"
                ], "additionalProperties": false


            }
        },
        "required": [
            "type",
            "attributes"
        ], "additionalProperties": false
    },


    "type": "object",
    "definitions": {
        "generalType": {
            "id" : "#generalType",
            "type": "string",
            "enum": [
                "test-address-prefix-types", "test-address-prefix-types-extended"
            ]
        }
    },
    "properties": {
        "data": {
            "oneOf": [
               {
                    "$merge": {
                        "source": {"$ref": "#/base-create-test-address-prefix-types"},
                        "with": {
                            "properties": {
                                "something": { "type": "string", "minLength": 2 }
                            }
                        }
                    }

                }
            ]
        }
    },
    "required": [
        "data"
    ]

}
;

var validate = ajv.compile(schema);

test({"data":{"something":"1", "attributes":{"notation": "A","prefixType": "A"},"type":"test-address-prefix-types-extended"}});


function test(data) {
  var valid = validate(data);
  if (valid) console.log('Valid!');
  else console.log('Invalid: ' + ajv.errorsText(validate.errors));
}
```
