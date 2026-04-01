# [1164] Object.prototype function causes an error

Here's the code:
```
const ajv = new require('ajv')();

Object.prototype.sayHi = (name) => console.log(`Hi ${name}`)
let sample = {
    name: 'Frank',
    age: 30,
    gender: 'Male'
    },
    schema = {
        "type": "object",
        "required": ["name", "age", "gender"],
        "properties": {
            "name": {"type": "string"},
            "age": {"type": "integer"},
            "gender": {"type": "string"}
        }
    };

console.log(ajv.validate(schema, sample));
```
Note: the sayHi function is just an example. In reality, we have to add a bunch of Object.prototype functions before the real validation. And it caused the following error:
```
$ node ajv_test.js 
$ref: keywords ignored in schema at path "#/properties/maxLength"
$ref: keywords ignored in schema at path "#/properties/minLength"
$ref: keywords ignored in schema at path "#/allOf/0"
$ref: keywords ignored in schema at path "#/properties/additionalItems"
$ref: keywords ignored in schema at path "#/properties/items/anyOf/0"
$ref: keywords ignored in schema at path "#/properties/items/anyOf/1"
$ref: keywords ignored in schema at path "#/items"
$ref: keywords ignored in schema at path "#/properties/maxItems"
$ref: keywords ignored in schema at path "#/properties/minItems"
$ref: keywords ignored in schema at path "#/properties/contains"
$ref: keywords ignored in schema at path "#/properties/maxProperties"
$ref: keywords ignored in schema at path "#/properties/minProperties"
$ref: keywords ignored in schema at path "#/properties/required"
$ref: keywords ignored in schema at path "#/properties/additionalProperties"
$ref: keywords ignored in schema at path "#/properties/definitions/additionalProperties"
$ref: keywords ignored in schema at path "#/properties/properties/additionalProperties"
$ref: keywords ignored in schema at path "#/properties/patternProperties/additionalProperties"
$ref: keywords ignored in schema at path "#/properties/dependencies/additionalProperties/anyOf/0"
$ref: keywords ignored in schema at path "#/properties/dependencies/additionalProperties/anyOf/1"
$ref: keywords ignored in schema at path "#/properties/propertyNames"
$ref: keywords ignored in schema at path "#/properties/type/anyOf/0"
$ref: keywords ignored in schema at path "#/properties/type/anyOf/1/items"
$ref: keywords ignored in schema at path "#/properties/if"
$ref: keywords ignored in schema at path "#/properties/then"
$ref: keywords ignored in schema at path "#/properties/else"
$ref: keywords ignored in schema at path "#/properties/allOf"
$ref: keywords ignored in schema at path "#/properties/anyOf"
$ref: keywords ignored in schema at path "#/properties/oneOf"
$ref: keywords ignored in schema at path "#/properties/not"
/ABC/node_modules/ajv/lib/ajv.js:177
    else throw new Error(message);
         ^

Error: schema is invalid: data.properties['sayHi'] should be object,boolean
    at Ajv.validateSchema (/ABC/node_modules/ajv/lib/ajv.js:177:16)
    at Ajv._addSchema (/ABC/node_modules/ajv/lib/ajv.js:306:10)
    at Ajv.validate (/ABC/node_modules/ajv/lib/ajv.js:94:26)
    at Object.<anonymous> (/ABC/src/ajv_test.js:19:17)
    at Module._compile (module.js:653:30)
    at Object.Module._extensions..js (module.js:664:10)
    at Module.load (module.js:566:32)
    at tryModuleLoad (module.js:506:12)
    at Function.Module._load (module.js:498:3)
    at Function.Module.runMain (module.js:694:10)

```

Verison:
"ajv": "^6.11.0"