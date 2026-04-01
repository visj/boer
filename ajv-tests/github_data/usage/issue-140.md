# [140] Issues with additonal properties evaluation

In the following code, in the  interface section is referenced in the device section. Additional property is set to false and required is mode. But the validation fails even if we give the right properties of interface.
If the required mode or the right enumeration for mode is not given, it throws the right error. 

Seems additional properties is not evaluated properly. Can you check.

Here is the error:
Invalid: data.configs.vid.desc.device.mgt0 should NOT have additional properties, data.configs.vid.desc.device.mgt0 should NOT have additional properties, data.configs.vid.desc.device.mgt0 should NOT have additional properties, data.configs.vid.desc.device.mgt0 should NOT have additional properties

``` javascript
var Ajv = require('ajv');
var ajv = Ajv({allErrors: true});

var schema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "title": "test schema version 1",
    "definitions": {
        "interface": {
            "properties": {
                "mode": {
                    "enum": [
                        "STATIC",
                        "DHCP",
                    ]
                },
                "address": {
                    "type": "string",
                    "format": "ipv4"
                },
                "netmask": {
                    "type": "string",
                    "format": "ipv4"
                },
                "network": {
                    "type": "string",
                    "format": "ipv4"
                },
                "gateway": {
                    "type": "string",
                    "format": "ipv4"
                },
            }
        },
        "content": {
            "properties": {
                "misc": {
                    "type": "string"
                },
                "id1": {
                    "type": "string"
                },
                "id2": {
                    "type": "string"
                },
                "device": {
                    "type": "object",
                    "properties": {
                        "Name": {
                            "type": "string"
                        },
                        "mgt0": {
                            "type": "object",
                            "$ref": "#/definitions/interface",
                            "additionalProperties": false,
                            "required": [
                                "mode"
                            ]
                        }
                    },
                    "additionalProperties": false,
                    "required": [
                        "mgt0"
                    ]
                }
            },
            "additionalProperties": false,
            "required": [
                "id1",
                "id2",
                "device",
            ]
        }
    },
    "type": "object",
    "properties": {
        "misc": {
            "type": "string"
        },
        "version": {
            "type": "string"
        },
        "configs": {
            "type": "object",
            "properties": {
                "vid": {
                    "type": "object",
                    "properties": {
                        "desc": {
                            "type": "object",
                            "$ref": "#/definitions/content"
                        }
                    },
                    "required": [
                        "desc"
                    ]
                }
            },
            "required": [
                "vid"
            ]
        }
    },
    "required": [
        "version",
        "configs"
    ]
};

var validate = ajv.compile(schema);

test({"configs":{"vid":{"desc":{"device":{"Name":"Cam","mgt0":{"mode":"STATIC","address":"10.0.1.2","netmask":"255.255.255.0","gateway":"10.0.1.1"}},"id1":"2","id2":"4"},"keyEncryption":false}},"version":"14"});

function test(data) {
    var valid = validate(data);
    if (valid) console.log('Valid!');
    else console.log('Invalid: ' + ajv.errorsText(validate.errors));
}
```
