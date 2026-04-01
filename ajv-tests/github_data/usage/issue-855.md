# [855] Ajv is not validating $ref in schema. It is not checking existence.

I am trying validate petstore.json using ajv. 
Schema: http://swagger.io/v2/schema.json
Json Data : https://github.com/OAI/OpenAPI-Specification/blob/master/examples/v2.0/json/petstore.json

Ajv is somehow not validating '$ref' in json. I am using the following code to validate the data.
```
var Ajv = require('ajv');
var ajv = new Ajv({schemaId: 'id',sourceCode: true,$data:true,missingRefs:true});
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
var schema = require('./schemav2.json');
var mydata = require("./petstore.json");
var valid = ajv.validate(schema, mydata);
if (!valid) console.log(ajv.errors);
console.log(typeof valid);
``` 
If I change 'petstore.json' like following (marked in bold). I am changing schema reference for default response. I am pointing it to $ref": "#/definitions/Error22, now #/definitions/Error22 does not exist in the document. I want ti throw error if reference in not valid but ajv validation passing it.
**I need help to validate schema where it will check the existence of '$ref'.**

"/pets": {
"get": {
        "summary": "List all pets",
        "operationId": "listPets",
        "tags": [
          "pets"
        ],
        "parameters": [
          {
            "name": "limit",
            "in": "query",
            "description": "How many items to return at one time (max 100)",
            "required": false,
            "type": "integer",
            "format": "int32"
          }
        ],
        "responses": {
          "200": {
            "description": "An paged array of pets",
            "headers": {
              "x-next": {
                "type": "string",
                "description": "A link to the next page of responses"
              }
            },
            "schema": {
              "$ref": "#/definitions/Pets"
            }
          },
          "default": {
            "description": "unexpected error",
            "schema": {
              "**$ref": "#/definitions/Error22**"
            }
          }
        }
      }
