# [381] allOf with empty schemas fail to compile

Schema:

```json
{
  "allOf": [
    {}
  ]
}
```

Code:

```javascript
ajv = new Ajv;
ajv.compile(schema);
```

Error:

```
Error compiling schema, function code:  var validate =  (function  (data, dataPath, parentData, parentDataProperty, rootData) { 'use strict';         if (rootData === undefined) rootData = data;     }      validate.errors = null; return true;        }); return validate;
```

Validating function code:
```javascript
var validate = (function(data, dataPath, parentData, parentDataProperty, rootData) {
    'use strict';
    if (rootData === undefined) rootData = data;
}
validate.errors = null;
return true;
});
return validate;
```