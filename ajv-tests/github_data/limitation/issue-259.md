# [259] Support validating meta-schemas against themselves

Hello,

I am using ajv@4.3.0 and Node v6.3.1. The [JSON Schema reference](https://spacetelescope.github.io/understanding-json-schema/reference/schema.html) recommends that all schemas have a `$schema` keyword. I want to use [hyper schema](http://json-schema.org/draft-04/hyper-schema#), and so I have the following code below.

``` javascript
'use strict';

var ajv = require('ajv');

var validator = new ajv({});

var jsonHyperSchema = getHyperSchema();

validator.addMetaSchema(jsonHyperSchema);

function getHyperSchema() {
    return {
        // copy contents of hyper schema here
    }
}
```

However, I get this error...

```
Error: no schema with key or ref "http://json-schema.org/draft-04/hyper-schema#"
```

Am I loading the schema correctly, or is this a bug?
