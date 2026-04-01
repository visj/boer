# [836] Facing issue in validating response data against open api 3.0 specification using ajv.

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

I am using the latest version of ajv. (6.5.2)

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript


```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->
OpenApi.json
```json
{
  "openapi": "3.0.1",
  "info": {
    "title": "Open API sample",
    "version": "0.1.0"
  },
  "servers": [
    {
      "url": "https://api.test.com/openapitest/v1"
    }
  ],
  "paths": {
    "/products": {
      "get": {
        "summary": "Storage products",
        "operationId": "StorageProductsGet",
        "responses": {
          "200": {
            "description": "Array of storage products",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/StorageProductsResponse"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "StorageProduct": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          }
        }
      },
      "Data": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "type": {
            "type": "string",
            "enum": [
              "json"
            ]
          }
        },
        "required": [
          "type"
        ]
      },
      "StorageProductsResponse": {
        "allOf": [
          {
            "$ref": "#/components/schemas/Data"
          },
          {
            "type": "object",
            "properties": {
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/StorageProduct"
                }
              }
            }
          }
        ]
      }
    }
  }
}

```


**Sample data**
data2.json
<!-- Please make it as small as posssible to reproduce the issue -->

```json

[
  {
    "name": "testing",
    "description": "123",
    "type": "json",
    "data": [
      {
        "id": "test",
        "name": "test2"
      }
    ]
  }
]
```


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

```javascript

var Ajv = require('ajv');
var ajv = new Ajv({allErrors: true,format: false});
const fs = require('fs');

let rawdata = fs.readFileSync('OpenApi.json');  
let schema = JSON.parse(rawdata); 

 let responseData = fs.readFileSync('data2.json');  
 let data = JSON.parse(responseData); 
 
ajv.addSchema(schema, 'openapi.json');
var valid = ajv.validate({ $ref: 'openapi.json#/components/schemas/StorageProductsResponse' }, data);
if (valid) console.log('Valid!');
else console.log('Invalid: ' + ajv.errorsText(valid.errors));

```


**Validation result, data AFTER validation, error messages**

```
Invalid: data should be object, data should be object

Note: If i remove square brackets from the data (ie data2.json)  , It is working as expected.
However as per specification schema, response data should be an array not object. so here the problem seems to be related to resolving reference for response schema using $ref keyword.

```

**What results did you expect?**

Valid! 

**Are you going to resolve the issue?**
