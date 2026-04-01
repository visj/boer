# [88] How to get $ref in errors?

Hi,

I plan to create error messages based on $ref which caused errors. To do this, I need to get $ref in error object. You can see sample code below:

``` js
'use strict';
var Ajv = require('ajv');

var schema = {
    'type': 'object',
    'additionalProperties': false,
    'properties': {
        'mac': {
            '$ref': '#/definitions/macaddr'
        }
    },
    'definitions': {
        'macaddr': { type: 'string', pattern: '^c' }
    }
};

var data = {
    mac: 'a'
};

var ajv = Ajv({
    allErrors:  true,
    format:     'full',
    v5:         true
});

var validate = ajv.compile(schema);
var valid    = validate(data);

if (!valid) console.log(validate.errors);
```

which results with this error object:

```
[ { keyword: 'pattern',
    dataPath: '.mac',
    schemaPath: '.pattern',
    params: { pattern: '^c' },
    message: 'should match pattern "^c"' } ]
```

How can I obtain `#/definitions/macaddr` in error message?

Best Regards,
