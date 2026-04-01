# [307] Unexpected validation failure

Schema:

https://github.com/OAI/OpenAPI-Specification/blob/master/schemas/v2.0/schema.json

API definition example:

https://github.com/OAI/OpenAPI-Specification/blob/master/examples/v2.0/json/petstore-minimal.json

In AJV this fails with:

```
[ { keyword: 'not',
    dataPath: '.paths[\'/pets\'].get.responses',
    schemaPath: '#/not',
    params: {},
    message: 'should NOT be valid' } ]
```

This otherwise succeeds at http://www.jsonschemavalidator.net/
