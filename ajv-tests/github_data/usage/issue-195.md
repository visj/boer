# [195] how can I use swagger spec definitions

Is there any easy way I could validate data against definitions from swagger spec ?

``` javascript

import test from 'ava';
import ajv from 'ajv';

const swagger = {
    "swagger": "2.0",
    "definitions": {
        "Employee": {
            "required": [
                "name"
            ],
            "properties": {
                "image": {
                    "$ref": "#/definitions/Image"
                },
                "name": {
                    "type": "string"
                }
            }
        },
        "Image": {
            "required": [
                "url"
            ],
            "properties": {
                "url": {
                    "type": "string"
                },
                "title": {
                    "type": "string"
                }
            }
        }
    }
}

const schema = ajv({
    schemas: swagger.definitions,
    removeAdditional: true
});

test(t => {
    var isValid = schema.validate('Employee', {
        name: "John"
    })
    t.equa(isValid, true);
});
```

the result is:

``` javascript
   1 failed

  1. [anonymous]
  failed with "can't resolve reference #/definitions/Image from id #"
      Object.generate_ref [as code] (node_modules/ajv/lib/dotjs/ref.js:62:22)
    Object.generate_validate [as validate] (node_modules/ajv/lib/dotjs/validate.js:374:37)
    Object.generate_properties [as code] (node_modules/ajv/lib/dotjs/properties.js:193:26)
    generate_validate (node_modules/ajv/lib/dotjs/validate.js:374:37)
    localCompile (node_modules/ajv/lib/compile/index.js:53:22)
    Ajv.compile (node_modules/ajv/lib/compile/index.js:42:10)
    _compile (node_modules/ajv/lib/ajv.js:294:29)
    getSchema (node_modules/ajv/lib/ajv.js:184:51)
    Ajv.validate (node_module
```
