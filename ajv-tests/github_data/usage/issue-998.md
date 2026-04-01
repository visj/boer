# [998] array[oneOf] validation

Hi,

I try to validate an array which can have 2 objects type (item_id and item_ref).
Each model item_id and item_ref are valid, but when I try to validate the array I have an error.

What I do wrong ?

Use AJV 6.10

**Ajv options object**
```javascript
            var options = {
                allErrors: true,
                verbose: true,
                removeAdditional: false,
                processCode: require('js-beautify').js_beautify     // for debugging, beautify generated source code
            };
```


**JSON Schema**
```json
{
  "swagger": "2.0",
  "info": {
    "title": "Test API",
    "version": "1.0"
  },
  "host": "example.com",
  "paths": {},
  "definitions": {
    "container": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "items": {
          "type": "array",
          "items": {
            "oneOf": [
              {
                "$ref": "#/definitions/item_ref"
              },
              {
                "$ref": "#/definitions/item_id"
              }
            ]
          }
        }
      }
    },
    "item_base": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        }
      }
    },
    "item_ref": {
      "allOf": [
        {
          "type": "object",
          "properties": {
            "reference": {
              "type": "string"
            },
            "price": {
              "type": "number"
            }
          }
        },
        {
          "$ref": "#/definitions/item_base"
        }
      ]
    },
    "item_id": {
      "allOf": [
        {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          }
        },
        {
          "$ref": "#/definitions/item_base"
        }
      ]
    }
  }
}
```


**Sample data**
```json
       {
            name: 'name of the resource',
            items: [
                {
                    name: 'name of the item_id',
                    id: '123'
                }
            ]
        }

```


**Your code**

```javascript
        var validateModel = function(modelName, model)
        {
            var SwaggerSchema = require('./test.json');

            var options = {
                allErrors: true,
                verbose: true,
                removeAdditional: false,
                processCode: require('js-beautify').js_beautify     // for debugging, beautify generated source code
            };
                
            var ajv = require('ajv')(options);
            ajv.addSchema(SwaggerSchema, 'swagger.json');

            var modelDef = { $ref: 'swagger.json#/definitions/' + modelName };
            var result = ajv.validate(modelDef, model);

            return {
                valid: result,
                errors: ajv.errors
            }
        };

        var itemId = {
            name: 'name of the item_id',
            id: '123'
        };

        var itemRef = {
            name: 'name of the item_reference',
            reference: 'ABCD',
            price: 12.34
        };

        var container = {
            name: 'name of the resource',
            items: [
                itemId,
                // itemRef
            ]
        };

        var validationItemId = validateModel("item_id", itemId);
        if(!validationItemId.valid)
        {
            var errorMsg = validationItemId.errors;
            var foo = 3;
        }
        var validationItemRef = validateModel("item_ref", itemRef);
        if(!validationItemRef.valid)
        {
            var errorMsg = validationItemRef.errors;
            var foo = 3;
        }

        var validationContainer = validateModel("container", container);
        if(!validationContainer.valid)
        {
            var errorMsg = validationContainer.errors; // should match exactly one schema in oneOf
            var foo = 3;
        }
```


