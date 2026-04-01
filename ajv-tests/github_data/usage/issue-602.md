# [602] Error when reading schema from the external file


[credit-exchange.txt](https://github.com/epoberezkin/ajv/files/1406985/credit-exchange.txt)
Hi,

I have defined by schema in the external text file, The same file is attached. I read this file by standard fs node module, When I called the validate method it gives me error as 

```
Error: no schema with key or ref "{
    "$id": "http://example.com/schemas/schema.json",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "firstName": {
            "type": "string"
        },
        "age": {
            "type": "integer"
        },
        "dateofBirth": {
            "type": "string"
        }
    },
    "required": [ "firstName" ]
  }
"
    at Ajv.validate (/home/dave/lf-bi-api/node_modules/ajv/lib/ajv.js:94:19)
    at JsonValidator._callee$ (/home/dave/lf-bi-api/.webpack/service/webpack:/src/jsonvalidator.js:25:23)
    at tryCatch (/home/dave/lf-bi-api/node_modules/regenerator-runtime/runtime.js:65:40)
    at GeneratorFunctionPrototype.invoke [as _invoke] (/home/dave/lf-bi-api/node_modules/regenerator-runtime/runtime.js:299:22)
    at GeneratorFunctionPrototype.prototype.(anonymous function) [as next] (/home/dave/lf-bi-api/node_modules/regenerator-runtime/runtime.js:117:21)

```

