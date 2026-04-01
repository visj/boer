# [477] Request for guidance or is this an issue in the library

Hello

I npm installed ajv yesterday so will assume I am using the latest version

**Ajv options object**
```
var Ajv = require('ajv');
var ajv = new Ajv({allErrors: true});

```


**JSON Schema**
NOTE: This is an extended version of the draft-7 meta schema

```
var metaSchema = 
{
    "$schema": "http://json-schema.org/draft-06/schema#",
    "$id": "oc-meta",
    "title": "Core schema meta-schema",
    "definitions": {
        "schemaArray": {
            "type": "array",
            "minItems": 1,
            "items": { "$ref": "#" }
        },
        "nonNegativeInteger": {
            "type": "integer",
            "minimum": 0
        },
        "nonNegativeIntegerDefault0": {
            "allOf": [
                { "$ref": "#/definitions/nonNegativeInteger" },
                { "default": 0 }
            ]
        },
        "simpleTypes": {
            "enum": [
                "array",
                "boolean",
                "integer",
                "null",
                "number",
                "object",
                "string"
            ]
        },
        "stringArray": {
            "type": "array",
            "items": { "type": "string" },
            "uniqueItems": true,
            "default": []
        },
        "patternString" : {
            "type" : "object",
            "properties" : { 
                "type": {
                    "type": "string",
                    "enum" : ["string"]
                },
                "description": {
                    "type": "string"
                },
                "pattern": {
                    "type": "string",
                    "format": "regex"
                },
            },
            "required" : ["type", "description", "pattern"]
        },
        "simpleString" : {
            "type" : "object",
            "properties" : { 
                "type": {
                    "type": "string",
                    "enum" : ["string"]
                },
                "description": {
                    "type": "string",
                    "minLength" : 5
                },
                "maxLength": { "$ref": "#/definitions/nonNegativeInteger" },
                "minLength": { "$ref": "#/definitions/nonNegativeIntegerDefault0" }
            },
            "required" : ["type", "description", "minLength", "maxLength"]
        },
        "enumString" : {
            "type" : "object",
            "properties" : { 
                "type": {
                    "type": "string",
                    "enum" : ["string"]
                },
                "description": {
                    "type": "string",
                    "minLength" : 5
                },
                "enum": {
                    "type": "array",
                    "minItems": 1,
                    "uniqueItems": true
                }
            },
            "required" : ["type", "description", "enum"]
        },
        "simpleNumber" : {
            "type" : "object",
            "properties" : { 
                "type": {
                    "type": "string",
                    "enum" : ["number"]
                },
                "description": {
                    "type": "string",
                    "minLength" : 5
                },
                "maximum": {
                    "type": "number"
                },
                "exclusiveMaximum": {
                    "type": "number"
                },
                "minimum": {
                    "type": "number"
                },
                "exclusiveMinimum": {
                    "type": "number"
                }
            },
            "required" : ["type", "description", "maximum"]
        },
        "simpleInteger" : {
            "type" : "object",
            "properties" : { 
                "type": {
                    "type": "string",
                    "enum" : ["integer"]
                },
                "description": {
                    "type": "string",
                    "minLength" : 5
                },
                "maximum": {
                    "type": "integer"
                },
                "exclusiveMaximum": {
                    "type": "integer"
                },
                "minimum": {
                    "type": "integer"
                },
                "exclusiveMinimum": {
                    "type": "integer"
                }
            },
            "required" : ["type", "description", "maximum"]
        },
        "simpleObject" : {
            "type" : "object",
            "properties" : { 
                "type": {
                    "type": "string",
                    "enum" : ["object"]
                },
                "description": {
                    "type": "string",
                    "minLength" : 5
                },
                "properties": {
		            "type": "object",
		            "additionalProperties": { 
		            	"oneOf": [
	                        { "$ref": "#/definitions/patternString" },
	                        { "$ref": "#/definitions/simpleString" },
	                        { "$ref": "#/definitions/enumString" },
	                        { "$ref": "#/definitions/simpleNumber" },
	                        { "$ref": "#/definitions/simpleInteger" },
	                        { "$ref": "#/definitions/simpleObject" }
	                    ],
		            "default": {}
		        	}
		        },
                "required": { 
                    "$ref": "#/definitions/stringArray" 
                }
            },
            "required" : ["type", "properties"]
        }
    },
    "type": ["object", "boolean"],
    "oneOf" : [
        { "$ref": "#/definitions/patternString" },
        { "$ref": "#/definitions/simpleString" },
        { "$ref": "#/definitions/enumString" },
        { "$ref": "#/definitions/simpleNumber" },
        { "$ref": "#/definitions/simpleInteger" },
        { "$ref": "#/definitions/simpleObject" }
    ],
    "properties": {
        "$id": {
            "type": "string",
            "format": "uri-reference"
        },
        "$schema": {
            "type": "string",
            "format": "uri"
        },
        "$ref": {
            "type": "string",
            "format": "uri-reference"
        },
        "title": {
            "type": "string"
        },
        "description": {
            "type": "string"
        },
        "default": {},
        "multipleOf": {
            "type": "number",
            "exclusiveMinimum": 0
        },
        "maximum": {
            "type": "number"
        },
        "exclusiveMaximum": {
            "type": "number"
        },
        "minimum": {
            "type": "number"
        },
        "exclusiveMinimum": {
            "type": "number"
        },
        "maxLength": { "$ref": "#/definitions/nonNegativeInteger" },
        "minLength": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
        "pattern": {
            "type": "string",
            "format": "regex"
        },
        "additionalItems": { "$ref": "#" },
        "items": {
            "anyOf": [
                { "$ref": "#" },
                { "$ref": "#/definitions/schemaArray" }
            ],
            "default": {}
        },
        "maxItems": { "$ref": "#/definitions/nonNegativeInteger" },
        "minItems": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
        "uniqueItems": {
            "type": "boolean",
            "default": false
        },
        "contains": { "$ref": "#" },
        "maxProperties": { "$ref": "#/definitions/nonNegativeInteger" },
        "minProperties": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
        "required": { "$ref": "#/definitions/stringArray" },
        "additionalProperties": { "$ref": "#" },
        "definitions": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "properties": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "patternProperties": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "dependencies": {
            "type": "object",
            "additionalProperties": {
                "anyOf": [
                    { "$ref": "#" },
                    { "$ref": "#/definitions/stringArray" }
                ]
            }
        },
        "propertyNames": { "$ref": "#" },
        "const": {},
        "enum": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true
        },
        "type": {
            "anyOf": [
                { "$ref": "#/definitions/simpleTypes" },
                {
                    "type": "array",
                    "items": { "$ref": "#/definitions/simpleTypes" },
                    "minItems": 1,
                    "uniqueItems": true
                }
            ]
        },
        "format": { "type": "string" },
        "allOf": { "$ref": "#/definitions/schemaArray" },
        "anyOf": { "$ref": "#/definitions/schemaArray" },
        "oneOf": { "$ref": "#/definitions/schemaArray" },
        "not": { "$ref": "#" }
    },
    "required" : ["type"],
    "default": {}
}


```


**Sample data**
NOTE: I am trying to validate the schema itself, so my sample data is my schema

```
var schema = 
{
	"$schema" : "oc-meta",
	"$id" : "oc-test",
	"title": "Person",
	"type": "object",
	"properties": {
		"firstName": {
			"type": "string",
			"description" : "yoyoyo",
			"enum" : ["hey_there"]
		},
		"lastName": {
						"description": "Age in years",
						"type": "string",
						"pattern" : "[A-Z](0,30)"
		},
		"age": {
			"description": "Age in years",
			"type": "integer",
			"minimum": 0,
			"maximum" : 199
		},
		"newOBj" : {
			"type" : "object",
			"properties" : {
				"bad_string_one": {
					"description": "Age in years",
					"type": "string"
				},
				"bad_string_two": {
					"description": "Age in years",
					"type": "string"
				}
			}
		}
	},
	"required": ["firstName", "lastName"]
}


```


**Your code**
This bit is small at least :) 

```
ajv.addMetaSchema(metaSchema, 'myMetaSchema');
try {ajv.addSchema(schema, 'mySchema');}
catch (err) {
	var str = ajv.errorsText()
	var arr = str.split(",")
	console.log(arr)
}

```


**Validation result, data AFTER validation, error messages**

```
[ 'data.properties[\'newOBj\'].properties[\'bad_string_one\'] should have required property \'pattern\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'] should have required property \'maxLength\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'] should have required property \'minLength\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'] should have required property \'enum\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'] should have required property \'maximum\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'] should have required property \'maximum\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'] should have required property \'properties\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'] should match exactly one schema in oneOf',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'] should have required property \'pattern\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'] should have required property \'maxLength\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'] should have required property \'minLength\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'] should have required property \'enum\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'] should have required property \'maximum\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'] should have required property \'maximum\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'] should have required property \'properties\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'] should match exactly one schema in oneOf',
  ' data.properties[\'newOBj\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'] should have required property \'description\'',
  ' data.properties[\'newOBj\'] should have required property \'pattern\'',
  ' data.properties[\'newOBj\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'] should have required property \'description\'',
  ' data.properties[\'newOBj\'] should have required property \'maxLength\'',
  ' data.properties[\'newOBj\'] should have required property \'minLength\'',
  ' data.properties[\'newOBj\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'] should have required property \'description\'',
  ' data.properties[\'newOBj\'] should have required property \'enum\'',
  ' data.properties[\'newOBj\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'] should have required property \'description\'',
  ' data.properties[\'newOBj\'] should have required property \'maximum\'',
  ' data.properties[\'newOBj\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'] should have required property \'description\'',
  ' data.properties[\'newOBj\'] should have required property \'maximum\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'] should have required property \'pattern\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'] should have required property \'maxLength\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'] should have required property \'minLength\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'] should have required property \'enum\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'] should have required property \'maximum\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'] should have required property \'maximum\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'] should have required property \'properties\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'] should match exactly one schema in oneOf',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'] should have required property \'pattern\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'] should have required property \'maxLength\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'] should have required property \'minLength\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'] should have required property \'enum\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'] should have required property \'maximum\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'] should have required property \'maximum\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'] should have required property \'properties\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_two\'] should match exactly one schema in oneOf',
  ' data.properties[\'newOBj\'] should match exactly one schema in oneOf',
  ' data.type should be equal to one of the allowed values',
  ' data should have required property \'description\'',
  ' data should have required property \'pattern\'',
  ' data.type should be equal to one of the allowed values',
  ' data should have required property \'description\'',
  ' data should have required property \'maxLength\'',
  ' data should have required property \'minLength\'',
  ' data.type should be equal to one of the allowed values',
  ' data should have required property \'description\'',
  ' data should have required property \'enum\'',
  ' data.type should be equal to one of the allowed values',
  ' data should have required property \'description\'',
  ' data should have required property \'maximum\'',
  ' data.type should be equal to one of the allowed values',
  ' data should have required property \'description\'',
  ' data should have required property \'maximum\'',
  ' data.properties[\'newOBj\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'] should have required property \'description\'',
  ' data.properties[\'newOBj\'] should have required property \'pattern\'',
  ' data.properties[\'newOBj\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'] should have required property \'description\'',
  ' data.properties[\'newOBj\'] should have required property \'maxLength\'',
  ' data.properties[\'newOBj\'] should have required property \'minLength\'',
  ' data.properties[\'newOBj\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'] should have required property \'description\'',
  ' data.properties[\'newOBj\'] should have required property \'enum\'',
  ' data.properties[\'newOBj\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'] should have required property \'description\'',
  ' data.properties[\'newOBj\'] should have required property \'maximum\'',
  ' data.properties[\'newOBj\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'] should have required property \'description\'',
  ' data.properties[\'newOBj\'] should have required property \'maximum\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'] should have required property \'pattern\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'] should have required property \'maxLength\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'] should have required property \'minLength\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'] should have required property \'enum\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'].type should be equal to one of the allowed values',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'] should have required property \'maximum\'',
  ' data.properties[\'newOBj\'].properties[\'bad_string_one\'].type should be equal to one of the allowed values',
  ... 17 more items ]

```

**What results did you expect?**
In this particular example, bad_string_one and bad_string_two don't validate against the meta_schema. 
This also then means that the entire parent structure fails to validate against the meta schema as well.
The errorText() includes an error message for every possible meta-schema property that it could have parsed against, for the entire parent tree, including properties that it actually does include (e.g. type in this example). This is incredibly verbose and slightly misleading
If I remove the {allErrors: true} then I get a much smaller error set but only for bad_string_one

**Are you going to resolve the issue?**
I am essentially looking for advice and/or confirmation if this is deliberate behaviour. This feels like too detailed a question to place on gitter, but I apologise if this is also the incorrect forum 
For the massive selection of errors for all possible combinations, I could write some code that tries to find unique paths. This does become a bit of a faff for the entire parent tree but I guess it justifiable as parents are invalid until the children are invalid

However, if you have any pointers, or believe that this highlights an issue in the validator, please let me know

Thank you

Oliver
