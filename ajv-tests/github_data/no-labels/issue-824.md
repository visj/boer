# [824] enum can't be nullable?


**What version of Ajv are you using? Does the issue happen if you use the latest version?**
current ajv= 6.0.0 
last ajv= 6.5.0  same error



My error category can be null or one element of enum. why don't work correctly?

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
var schema = {
  "title": "test",
  "events": [
    "test",
  ],
  "properties": {
    "error_category": {
      "type": ["string", "null"],
      "enum": [
        "test1",
        "test2",
        "test3",
      ],
    },
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
data = {
"event": "test",
 "error_category": null
}

```


**Your code**


**Validation result, data AFTER validation, error messages**

```
ERROR: [ { keyword: 'enum',
    dataPath: '.error_category',
    schemaPath: '#/properties/error_category/enum',
    params: { allowedValues: [Array] },
    message: 'should be equal to one of the allowed values' } ]

```

**What results did you expect?**
i expected an Ok status.


**Are you going to resolve the issue?**

i believe that works with bellow code but why not with above?:

```
error_category: {
      oneOf: [
        { type: 'null' },
        {
          type: 'string',
          enum: [
            'test1',
            'test2',
            'test3',
          ],
        },
      ],
    },
```