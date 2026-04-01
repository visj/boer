# [2461] contains with maxContains and minContains not behaving as expected

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
  "version": "8.12.0",

**Ajv options object**

```javascript
import AJV from "ajv/dist/2019";

    const ajv = new AJV({
        $data: true,
        useDefaults: true,
        allErrors: true,
        verbose: true,
        strict: false
    })
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
		"testFields": {
                    "type": "array",
                    "minItems": 1,
                    "contains": {
                      "properties": {
                        "lastUpdatedAtTime": {
                          "const": true
                        }
                      }
                    },
                    "minContains": 1,
                    "maxContains": 1,
                    "items": {
                      "type": "object",
                      "properties": {
                        "name": {
                          "description": "",
                          "type": "string"
                        },
                        "lastUpdatedAtTime": {
                          "description": "Whether the field is a 'Date-time modified' field.",
                          "type": "boolean",
                          "default": false
                        }
                      },
                      "additionalProperties": false
                    },
                    "uniqueItemProperties": [
                      "name"
                    ]
                  }
```


**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
[
    {
        "lastUpdatedAtTime": true,
        "name": "test1"
    },
    {
        "lastUpdatedAtTime": false,
        "name": "test2"
    },
    {
        "lastUpdatedAtTime": false,
        "name": "test3"
    },
    {
        "lastUpdatedAtTime": true,
        "name": "test4"
    }
]
```

**Your code**

```javascript
    const validate = ajv.compile(jsonSchema)
    validate(data);
```

**Validation result, data AFTER validation, error messages**

```
[
    {
        "instancePath": "/solutionFactoryConfiguration/viObjects/entities/1/testFields/1/lastUpdatedAtTime",
        "schemaPath": "#/properties/solutionFactoryConfiguration/properties/viObjects/properties/entities/items/properties/testFields/contains/properties/lastUpdatedAtTime/const",
        "keyword": "const",
        "params": {
            "allowedValue": true
        },
        "message": "must be equal to constant",
        "schema": true,
        "parentSchema": {
            "const": true
        },
        "data": false
    },
    {
        "instancePath": "/solutionFactoryConfiguration/viObjects/entities/1/testFields/2/lastUpdatedAtTime",
        "schemaPath": "#/properties/solutionFactoryConfiguration/properties/viObjects/properties/entities/items/properties/testFields/contains/properties/lastUpdatedAtTime/const",
        "keyword": "const",
        "params": {
            "allowedValue": true
        },
        "message": "must be equal to constant",
        "schema": true,
        "parentSchema": {
            "const": true
        },
        "data": false
    },
    {
        "instancePath": "/solutionFactoryConfiguration/viObjects/entities/1/testFields",
        "schemaPath": "#/properties/solutionFactoryConfiguration/properties/viObjects/properties/entities/items/properties/testFields/contains",
        "keyword": "contains",
        "params": {
            "minContains": 1,
            "maxContains": 1
        },
        "message": "must contain at least 1 and no more than 1 valid item(s)",
        "schema": {
            "properties": {
                "lastUpdatedAtTime": {
                    "const": true
                }
            }
        },
        "parentSchema": {
            "type": "array",
            "minItems": 1,
            "contains": {
                "properties": {
                    "lastUpdatedAtTime": {
                        "const": true
                    }
                }
            },
            "minContains": 1,
            "maxContains": 1,
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "description": "",
                        "type": "string"
                    },
                    "lastUpdatedAtTime": {
                        "description": "Whether the field is a 'Date-time modified' field.",
                        "type": "boolean",
                        "default": false
                    }
                },
                "additionalProperties": false
            },
            "uniqueItemProperties": [
                "name"
            ]
        },
        "data": [
            {
                "name": "test1",
                "lastUpdatedAtTime": true
            },
            {
                "name": "test2",
                "lastUpdatedAtTime": false
            },
            {
                "name": "test3",
                "lastUpdatedAtTime": false
            },
            {
                "name": "test4",
                "lastUpdatedAtTime": true
            }
        ]
    }
]
```

**What results did you expect?**
I got three errors where I expected just one. I expected the third error as a result of using contains with maxContains and minContains because I had more than one row of test data where lastUpdatedAtTime: true. However I didn't expect the first two errors that say the lastUpdatedAtTime must be equal to constant and the only permitted value is true.

**Are you going to resolve the issue?**
I would like to but i'm not sure how. Apologies if i've made any mistakes or missed anything above this is my first issue submission.