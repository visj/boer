# [47] Resolve reference passed to validate and getSchema methods

Is is possible for validate function to resolve ids inside schemas ?
example :

``` javascript
var ajv = require('ajv')();

ajv.addSchema({
    id: 'my-schema',
    type: 'object',
    definitions: {
        foo: {
            id: 'foo',
            type: 'object',
            required: ['bar']
        }
    }
}, 'my-schema');


ajv.validate(
    'my-schema#/definitions/foo', {
        bar: true
    });

// throws Error: no schema with key or ref "my-schema#/definitions/foo"
```
